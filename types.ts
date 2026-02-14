export enum UserRole {
  STUDENT = 'Student',
  WORKING = 'Working Professional',
  UNEMPLOYED = 'Unemployed',
  RETIRED = 'Retired',
}

export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  HINGLISH = 'Hinglish',
}

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export interface Reminder {
  id: string;
  task: string;
  time: string;
  completed: boolean;
  lastTriggeredDate?: string; // Format: YYYY-MM-DD-HH:mm
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  role: UserRole;
  language: Language;
  reminders?: Reminder[];
  shippingAddress?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  links?: { title: string; uri: string }[];
}

export interface ChatSession {
  id: string;
  messages: Message[];
  createdAt: Date;
}