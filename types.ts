export interface User {
  id: string;
  name: string;
  email: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  groundingChunks?: GroundingChunk[];
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: 'Breathing' | 'Mindfulness' | 'Coping Strategy' | 'Learn';
  duration: string;
  content: string; // The text content or instructions
}

export interface MoodEntry {
  id: string;
  timestamp: number;
  score: number; // 1-10
  note: string;
}

export interface DailyMood {
  day: string; // 'Mon', 'Tue', etc.
  score: number | null; // Allow null for days with no data
  entry?: MoodEntry; // Linked entry for interactivity
}

export enum AppView {
  AUTH = 'AUTH',
  CHAT = 'CHAT',
  DASHBOARD = 'DASHBOARD',
  RESOURCES = 'RESOURCES'
}