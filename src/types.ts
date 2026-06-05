export type Gender = 'male' | 'female' | 'other';

export interface Lifestyle {
  smoking: boolean;
  exercise: boolean;
  diet: boolean;
  stress: boolean;
}

export interface Profile {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:MM
  expectedLifespan: number;
  gender: Gender;
  country: string;
  lifestyle: Lifestyle;
}

export type ViewMode = 'weeks' | 'months' | 'years';

export interface JournalEntry {
  id: string; // unit index (e.g. "week-1420", "month-320", "year-27")
  title: string;
  content: string;
  category: 'general' | 'milestone' | 'growth' | 'health' | 'career' | 'relationship' | 'travel';
  date: string;
}

export interface Milestone {
  id: string;
  age: number;
  titleEn: string;
  titleFa: string;
  descriptionEn: string;
  descriptionFa: string;
  icon: string;
  category: string;
  isCustom?: boolean;
}

export type ThemeName = 'zen' | 'cosmic' | 'vintage' | 'minimal' | 'aura';

export type Language = 'en' | 'fa';

export interface Settings {
  theme: ThemeName;
  language: Language;
  soundEnabled: boolean;
  ambientEnabled: boolean;
  uncensoredMode: boolean;
  darkMode: boolean;
}

