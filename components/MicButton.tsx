
import React, { useState, useEffect, useRef } from 'react';

interface MicButtonProps {
  onAudioData: (data: Float32Array) => void;
  isSessionActive: boolean;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

const MicButton: React.FC<MicButtonProps> = ({ onAudioData, isSessionActive, onRecordingStateChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    onRecordingStateChange?.(isRecording);
    if (!isRecording) {
      setVolume(0);
    }
  }, [isRecording, onRecordingStateChange]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calculate volume for visualization
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const v = Math.min(1, rms * 10); // More sensitive for feedback
        setVolume(v);

        onAudioData(new Float32Array(inputData));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    processorRef.current?.disconnect();
    streamRef.current?.getTracks().forEach(track => track.stop());
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    setIsRecording(false);
    setVolume(0);
  };

  const toggleRecording = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      {/* Background Ripples */}
      {isRecording && (
        <>
          <div 
            className="absolute rounded-full bg-blue-500/10 transition-transform duration-150 ease-out"
            style={{ 
              width: '100%', 
              height: '100%', 
              transform: `scale(${1 + volume * 1.5})`,
            }}
          />
          <div 
            className="absolute rounded-full bg-blue-400/5 transition-transform duration-300 ease-out"
            style={{ 
              width: '120%', 
              height: '120%', 
              transform: `scale(${1 + volume * 2})`,
            }}
          />
        </>
      )}

      {/* Mic Button */}
      <button 
        onClick={toggleRecording}
        disabled={!isSessionActive}
        className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 z-20 group ${
          !isSessionActive ? 'bg-zinc-800 opacity-50 cursor-not-allowed' :
          isRecording ? 'bg-blue-600 shadow-[0_0_40px_rgba(59,130,246,0.6)] scale-110' : 'bg-blue-600 hover:bg-blue-500 shadow-xl hover:scale-105'
        }`}
      >
        {/* Pulsing Core */}
        {isRecording && (
          <div className="absolute inset-0 bg-blue-400 opacity-20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
        )}

        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="white" viewBox="0 0 256 256" className="relative z-10">
          <path d="M128,176a48.05,48.05,0,0,0,48-48V64a48,48,0,0,0-96,0v64A48.05,48.05,0,0,0,128,176ZM96,64a32,32,0,0,1,64,0v64a32,32,0,0,1-64,0Zm112,64a8,8,0,0,1-16,0,64,64,0,0,0-128,0,8,8,0,0,1-16,0,80.11,80.11,0,0,1,72,79.6V232a8,8,0,0,1-16,0V215.6A80.11,80.11,0,0,1,208,128Z"></path>
        </svg>

        {/* Visual Indicator of capture */}
        {isRecording && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-blue-600 animate-pulse" />
        )}
      </button>

      {/* Floating Particles/Bars */}
      {isRecording && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="absolute bg-blue-400/40 rounded-full transition-all duration-200"
              style={{
                width: '4px',
                height: `${10 + volume * 40}px`,
                left: `${15 + i * 10}%`,
                top: '50%',
                transform: `translateY(-50%) rotate(${i * 45}deg) translateY(${35 + volume * 20}px)`,
                opacity: volume * 0.8
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MicButton;
