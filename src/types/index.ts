export type AppScreen =
  | 'splash'
  | 'home'
  | 'assistant'
  | 'conversation'
  | 'reminders'
  | 'gita-overview'
  | 'gita-session'
  | 'call-schedule'
  | 'settings'
  | 'voice-costume'
  | 'workspace'
  | 'habits';

export interface HabitItem {
  id: string;
  title: string;
  category: 'mindset' | 'fitness' | 'business' | 'wisdom' | 'discipline';
  icon: string;
  targetDaysPerWeek: number;
  currentStreak: number;
  longestStreak: number;
  history: Record<string, boolean>; // 'YYYY-MM-DD': boolean
  color: string;
}

export interface DayHeatmapData {
  date: string; // 'YYYY-MM-DD'
  dayOfWeek: number; // 0-6 (Sun-Sat)
  weekIndex: number;
  completedCount: number;
  totalHabits: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  completedHabitTitles: string[];
}

export interface TaskReminder {
  id: string;
  title: string;
  time: string;
  category: 'calls' | 'workout' | 'education' | 'design' | 'business' | 'other';
  enabled: boolean;
  completed: boolean;
  isToday: boolean;
}

export interface GitaSloka {
  id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  tamilPronunciation: string;
  tamilMeaning: string;
  englishMeaning: string;
  modernApplication: string;
  realLifeExample: string;
  audioDuration: string;
}

export interface CallScheduleItem {
  id: string;
  title: string;
  time: string;
  enabled: boolean;
  bulletPoints: string[];
  bannerImage: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'helios';
  text: string;
  timestamp: string;
  checklist?: { label: string; checked: boolean }[];
  quoteNote?: string;
}

export type VoiceCostumeId =
  | 'natural'
  | 'gita-sage'
  | 'titan-mentor'
  | 'cyber-ai'
  | 'cosmic-echo'
  | 'vintage-radio'
  | 'helium-sprite'
  | 'custom';

export interface VoiceCostumeSettings {
  id: VoiceCostumeId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  pitchSemitones: number; // -12 to +12
  playbackRate: number; // 0.5 to 1.8
  filterType: BiquadFilterType;
  filterFrequency: number; // Hz (100 - 10000)
  filterQ: number; // Resonance (0.5 - 15)
  distortionDrive: number; // 0 (clean) to 50 (overdrive)
  reverbWet: number; // 0 to 1
  delayTime: number; // seconds 0 to 0.6
  delayFeedback: number; // 0 to 0.8
  isRobotizer: boolean;
  color: string;
}

export type RingtonePresetId =
  | 'celestial-chime'
  | 'sacred-om-flute'
  | 'sunrise-marimba'
  | 'radar-pulse'
  | 'custom-local';

export interface RingtoneConfig {
  activeId: RingtonePresetId;
  customFileName?: string;
  customFileSize?: number;
  customDuration?: number;
  volume: number; // 0.0 to 1.0
}

export type AIVoicePersonaId =
  | 'ponniyin-regal'
  | 'gemini-aoede'
  | 'gemini-kore'
  | 'gemini-puck'
  | 'gemini-fenrir'
  | 'gemini-zephyr'
  | 'custom-voice';

export type AILanguageMode = 'bilingual' | 'tamil' | 'english';

export interface AIVoicePersona {
  id: AIVoicePersonaId;
  name: string;
  tamilName: string;
  description: string;
  geminiVoiceName: 'Aoede' | 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr';
  style: string;
  sampleTamilText: string;
  sampleEnglishText: string;
  color: string;
  badge: string;
}

export interface AIVoiceSettings {
  personaId: AIVoicePersonaId;
  languageMode: AILanguageMode;
  speechRate: number;
  customVoiceFileName?: string;
  hasCustomVoiceFile?: boolean;
  isNaturalAiVoiceEnabled: boolean;
}
