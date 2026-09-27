import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { UserProfile } from '../types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  status: 'Active' | 'Verified' | 'Standard';
  createdAt: number;
  lastLoginAt: number;
}

interface StoredSession {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

function loadUsers(): Record<string, StoredUser> {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading users file:', e);
  }
  return {};
}

function saveUsers(users: Record<string, StoredUser>) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving users file:', e);
  }
}

function loadSessions(): Record<string, StoredSession> {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading sessions file:', e);
  }
  return {};
}

function saveSessions(sessions: Record<string, StoredSession>) {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving sessions file:', e);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(storedHash, 'hex');
  if (hash.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(hash, storedBuf);
}

function toUserProfile(u: StoredUser): UserProfile {
  return {
    id: u.id,
    email: u.email,
    status: u.status,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  };
}

export function registerUser(emailRaw: string, password: string): { user: UserProfile; token: string } {
  const email = emailRaw.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Please enter a valid email address.');
  }

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const users = loadUsers();

  // Check existing
  const existing = Object.values(users).find((u) => u.email.toLowerCase() === email);
  if (existing) {
    throw new Error('An account with this email address already exists. Please log in.');
  }

  const id = `usr_${crypto.randomBytes(8).toString('hex')}`;
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);
  const now = Date.now();

  const newUser: StoredUser = {
    id,
    email,
    passwordHash,
    salt,
    status: 'Active',
    createdAt: now,
    lastLoginAt: now,
  };

  users[id] = newUser;
  saveUsers(users);

  // Generate session token (valid 30 days)
  const token = `tok_${crypto.randomBytes(32).toString('hex')}`;
  const sessions = loadSessions();
  sessions[token] = {
    token,
    userId: id,
    createdAt: now,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000,
  };
  saveSessions(sessions);

  return {
    user: toUserProfile(newUser),
    token,
  };
}

export function authenticateUser(emailRaw: string, password: string): { user: UserProfile; token: string } {
  const email = emailRaw.trim().toLowerCase();
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const users = loadUsers();
  const user = Object.values(users).find((u) => u.email.toLowerCase() === email);
  if (!user) {
    throw new Error('No account found with this email address.');
  }

  const isValid = verifyPassword(password, user.salt, user.passwordHash);
  if (!isValid) {
    throw new Error('Incorrect password. Please try again.');
  }

  const now = Date.now();
  user.lastLoginAt = now;
  users[user.id] = user;
  saveUsers(users);

  // Create session
  const token = `tok_${crypto.randomBytes(32).toString('hex')}`;
  const sessions = loadSessions();
  sessions[token] = {
    token,
    userId: user.id,
    createdAt: now,
    expiresAt: now + 30 * 24 * 60 * 60 * 1000,
  };
  saveSessions(sessions);

  return {
    user: toUserProfile(user),
    token,
  };
}

export function getUserByToken(token: string): UserProfile | null {
  if (!token) return null;
  const sessions = loadSessions();
  const session = sessions[token];
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    delete sessions[token];
    saveSessions(sessions);
    return null;
  }

  const users = loadUsers();
  const user = users[session.userId];
  if (!user) return null;

  return toUserProfile(user);
}

export function destroySession(token: string): void {
  if (!token) return;
  const sessions = loadSessions();
  if (sessions[token]) {
    delete sessions[token];
    saveSessions(sessions);
  }
}
