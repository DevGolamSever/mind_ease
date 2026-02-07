import { User, Message, MoodEntry } from '../types';

// Simple LocalStorage Database
// This saves all data directly in the user's browser.

const STORAGE_KEYS = {
  USERS: 'mind_ease_users',
  SESSION: 'mind_ease_session',
  MESSAGES: 'mind_ease_messages',
  MOODS: 'mind_ease_moods',
};

// Helper for realistic delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  // --- Auth ---
  async signUp(email: string, password: string, name: string) {
    await delay(500); // Simulate processing
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = { id: crypto.randomUUID(), email, password, name };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    return newUser;
  },

  async signIn(email: string, password: string) {
    await delay(500);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Create session
    const sessionUser = { id: user.id, email: user.email, name: user.name };
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));
    
    return { user: sessionUser };
  },

  async signOut() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  async getCurrentUser(): Promise<User | null> {
    const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionStr) return null;
    return JSON.parse(sessionStr);
  },

  // --- Chat ---
  async getMessages(): Promise<Message[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const allMessages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '{}');
    const userMessages = allMessages[user.id] || [];
    
    // Convert string timestamps back to Date objects
    return userMessages.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }));
  },

  async addMessage(message: Message) {
    const user = await this.getCurrentUser();
    if (!user) return;

    const allMessages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '{}');
    if (!allMessages[user.id]) allMessages[user.id] = [];
    
    // Ensure timestamp is preserved as string in JSON
    allMessages[user.id].push(message);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
  },

  async clearChat() {
    const user = await this.getCurrentUser();
    if (!user) return;
    
    const allMessages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES) || '{}');
    allMessages[user.id] = [];
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
  },

  // --- Moods ---
  async getMoods(): Promise<MoodEntry[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const allMoods = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOODS) || '{}');
    return allMoods[user.id] || [];
  },

  async addMood(score: number, note: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error("No user logged in");

    const allMoods = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOODS) || '{}');
    if (!allMoods[user.id]) allMoods[user.id] = [];

    const newMood = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      score,
      note
    };

    allMoods[user.id].push(newMood);
    localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(allMoods));
    
    return newMood;
  }
};