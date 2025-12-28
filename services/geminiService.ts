
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Type } from '@google/genai';
import { VerbalAtom, GenerationSlot } from '../types';

declare const process: any;

export const decodeBase64 = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const encodeBase64 = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createPcmBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encodeBase64(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export async function playTTS(text: string, audioContext: AudioContext) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioBuffer = await decodeAudioData(
        decodeBase64(base64Audio),
        audioContext,
        24000,
        1
      );
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS failed:", error);
  }
}

/**
 * Generates a specific Verbal Atom for a given Generation Slot and User context.
 * This is the core "Intelligent Matrix Expansion" logic.
 */
export async function generateAtomForSlot(profession: string, slot: GenerationSlot): Promise<VerbalAtom | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Act as a linguistic psychologist for the app "Dialogue: First English Use".
    The user is a ${profession}. They are facing a specific pressure point: "${slot.description}" (Category: ${slot.category}).
    
    TASK: Generate 1 English "Verbal Atom" that fits this moment.
    RULES:
    - Must be a stable, basic sentence.
    - Not dependent on deep technical knowledge.
    - SHORT: <= 7 words.
    - Purpose: Allow the user to "speak through" the freeze.
    
    Output in JSON:
    {
      "sample_pool": "Dynamic Mapping",
      "role": "Action role (e.g. Guard, Pivot, Exit)",
      "intent": "Intent in Chinese",
      "intent_en": "Intent in English",
      "native": "The actual English sentence",
      "fuzzy": "Fuzzy pronunciation guide for non-speakers",
      "fallback": ["2 smaller units"],
      "keywords": ["Core words"],
      "rhythm": "Rhythm pattern",
      "notes": "Linguistic note in Chinese (< 12 chars)"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sample_pool: { type: Type.STRING },
            role: { type: Type.STRING },
            intent: { type: Type.STRING },
            intent_en: { type: Type.STRING },
            native: { type: Type.STRING },
            fuzzy: { type: Type.STRING },
            fallback: { type: Type.ARRAY, items: { type: Type.STRING } },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            rhythm: { type: Type.STRING },
            notes: { type: Type.STRING }
          },
          required: ["native", "intent"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}');
    return { ...data, id: `gen-${slot.id}-${Date.now()}`, slotId: slot.id };
  } catch (error) {
    console.error("Generation failed:", error);
    return null;
  }
}

export class DialogueSession {
  private sessionPromise: Promise<any> | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private outputAudioContext: AudioContext;

  constructor(systemInstruction: string) {
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }

  async connect(onMessage: (text: string) => void, onInterrupted: () => void) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    this.sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => console.log('Live session opened'),
        onmessage: async (message: LiveServerMessage) => {
          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio) {
            this.playAudio(base64Audio);
          }
          if (message.serverContent?.outputTranscription) {
            onMessage(message.serverContent.outputTranscription.text);
          }
          if (message.serverContent?.interrupted) {
            this.stopAllAudio();
            onInterrupted();
          }
        },
        onerror: (e: any) => console.error('Live error', e),
        onclose: () => console.log('Live session closed'),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        systemInstruction: `You are a conversation partner. 
        Catch whatever the user says with a short, supportive, natural response (< 10 words).
        NEVER correct grammar. NEVER evaluate. Just react.`,
      },
    });
    return this.sessionPromise;
  }

  private async playAudio(base64: string) {
    const bytes = decodeBase64(base64);
    const audioBuffer = await decodeAudioData(bytes, this.outputAudioContext, 24000, 1);
    this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
    const source = this.outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputAudioContext.destination);
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    this.sources.add(source);
    source.onended = () => this.sources.delete(source);
  }

  private stopAllAudio() {
    this.sources.forEach(s => s.stop());
    this.sources.clear();
    this.nextStartTime = 0;
  }

  async sendAudio(blob: Blob) {
    if (this.sessionPromise) {
      const session = await this.sessionPromise;
      session.sendRealtimeInput({ media: blob });
    }
  }

  close() {
    this.sessionPromise?.then(s => s.close());
  }
}
