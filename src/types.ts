export type PersonalityId = 'casual' | 'tech' | 'storyteller' | 'tutor' | 'executive';

export interface Personality {
  id: PersonalityId;
  name: string;
  tagline: string;
  description: string;
  avatar: string;
  badge: string;
  themeColor: 'emerald' | 'cyan' | 'purple' | 'amber' | 'blue';
  systemPrompt: string;
  welcomeMessage: string;
  starters: string[];
  toneTraits: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  personalityId?: PersonalityId;
  isStreaming?: boolean;
  error?: boolean;
}

export type Theme = 'light' | 'dark';

export interface UserProfile {
  id: string;
  email: string;
  status: 'Active' | 'Verified' | 'Standard';
  createdAt: number;
  lastLoginAt?: number;
}

export function getEmailInitials(email: string): string {
  if (!email) return '?';
  const username = email.trim().toLowerCase().split('@')[0] || '';
  const parts = username.split(/[._\-\+]/).filter(Boolean);
  if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  const clean = username.replace(/[^a-zA-Z0-9]/g, '');
  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase();
  }
  if (clean.length === 1) {
    return clean[0].toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

