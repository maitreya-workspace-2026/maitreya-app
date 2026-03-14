
export enum AppMode {
  Dashboard = 'Dashboard',
  Conversation = 'Conversation',
  Journal = 'Journal',
  Podcasts = 'Podcasts',
  Settings = 'Settings',
}

export interface Message {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  image?: string;
  grounding?: GroundingChunk[];
  music?: Music;
  weather?: Weather;
  reminderConfirmation?: { title: string; category: string };
  importantDateConfirmation?: { event: string; date: string };
  podcastRecommendation?: Podcast;
}

export interface WebGrounding {
  uri?: string;
  title?: string;
}

export interface MapsGrounding {
  uri?: string;
  title?: string;
}
    
export interface GroundingChunk {
  web?: WebGrounding;
  maps?: MapsGrounding;
}

export interface Reminder {
    id: number;
    iconName: 'Pill' | 'Utensils' | 'WaterDrop' | 'Briefcase' | 'Heart';
    title: string;
    time: string;
    done: boolean;
    category: 'Personal' | 'Professional';
}

export interface ImportantDate {
    id: number;
    date: string; // YYYY-MM-DD
    event: string;
    reason: string;
    isRecurring: boolean;
}

export interface Music {
    title: string;
    artist: string;
}

export interface Weather {
    location: string;
    temperature: string;
    condition: 'Sunny' | 'Cloudy' | 'Rainy' | 'PartlyCloudy';
}

export interface MemoryAidFace {
    id: number;
    name: string;
    description: string;
    image: string; // base64 data URI
}

export interface MemoryAidPlace {
    id: number;
    name: string;
    description: string;
    image: string; // base64 data URI
}

export interface JournalEntry {
    id: string;
    timestamp: number;
    dateString: string;
    audioBase64: string;
    durationSec: number;
    note?: string;
}

export interface Podcast {
    id: string;
    title: string;
    host: string;
    category: 'Motivation' | 'Anxiety' | 'Depression' | 'Sleep' | 'Success' | 'Relationships';
    description: string;
    imageUrl: string;
    link: string;
}

export enum CountryCode {
  IN = '+91',
  US = '+1',
  GB = '+44',
  CA = '+1',
  AU = '+61',
}

export enum AgeGroup {
  '21-30' = '21-30',
  '31-40' = '31-40',
  '41-50' = '41-50',
  '51-65' = '51-65',
  '66-85' = '66-85',
}

export enum AIGender {
  Male = 'Male',
  Female = 'Female',
  NonBinary = 'Non-binary',
}

export enum AIVoicePersonality {
  Warm = 'Warm & Empathetic',
  Calm = 'Calm & Soothing',
  Cheerful = 'Cheerful & Energetic',
  Professional = 'Professional & Clear',
}

export enum AILanguage {
  English = 'English',
  Hindi = 'Hindi',
  Bengali = 'Bengali',
  Tamil = 'Tamil',
  Telugu = 'Telugu',
}

export enum Occupation {
  Student = 'Student',
  Healthcare = 'Healthcare Professional',
  IT = 'IT Professional',
  Education = 'Educator',
  Business = 'Business Owner / Entrepreneur',
  Homemaker = 'Homemaker',
  Retired = 'Retired',
  Other = 'Other',
}

export enum Relationship {
  Parent = 'Parent',
  Spouse = 'Spouse',
  Child = 'Child',
  Sibling = 'Sibling',
  Friend = 'Friend',
  Caregiver = 'Caregiver',
}