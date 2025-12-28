
export enum TriggerType {
  JUDGMENT = 'Judgment',
  PUSH = 'Push',
  UNCERTAIN = 'Uncertain',
  CORRECTION = 'Correction',
  COLLABORATION = 'Collaboration',
  INTERRUPTION = 'Interruption',
  DESCRIBE_SCENE = 'Describe Scene',
  DESCRIBE_MOOD = 'Describe Mood',
  SELF_POSITIONING = 'Self Positioning'
}

export interface PressureVector {
  judgment_frequency: number;
  urgency: number;
  abstraction: number;
  reversibility: number;
  emotion_expression: number;
}

export interface GenerationSlot {
  id: string;
  category: string;
  description: string;
}

export interface VerbalAtom {
  id: string;
  sample_pool: string;
  role: string;
  intent: string;
  intent_en: string;
  native: string;
  fuzzy: string;
  fallback: string[];
  keywords: string[];
  rhythm: string;
  notes: string;
  slotId?: string; // Links to the 300 generation slots
}

export interface SoundCard {
  id: string;
  target: string;
  targetCn?: string; // 新增：中文目标名称
  whyHard: string;
  practiceLine: string;
  commMode: string;
  accentNote: string;
  secretRules: string;
  status: 'hidden' | 'exposed' | 'active';
}

export interface UserProfile {
  username: string;
  profession: string;
  vector: PressureVector;
  exposedSounds: string[];
  exposedAtoms: string[];
  theme: 'dark' | 'light';
  language: 'cn' | 'en';
  email?: string;
  phone?: string;
  isRegistered: boolean;
  createdAt: number;
}

export type AppView = 'login' | 'home' | 'dialogue' | 'sound-cards' | 'map' | 'profile' | 'milestone' | 'secret-chamber';
