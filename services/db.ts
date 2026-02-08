import { User, Message, MoodEntry } from '../types';

// Simple LocalStorage Database
// This saves all data directly in the user's browser.
const API_BASE = "http://localhost:5000/api";

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
    // 1. Save to Database
    const response = await fetch(`${API_BASE}/users/register`, { // Adjust route as per your backend
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Signup failed');
    }

    const newUser = await response.json(); // This now has the MongoDB _id

    // 2. Save to Local Storage for persistence
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    return newUser;
  },

async signIn(email: string, password: string) {
    // 1. Verify with Database
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid email or password');
    }

    const { user } = await response.json();

    // 2. Create session in Local Storage
    // Ensure we use user._id from MongoDB here
    const sessionUser = { id: user._id, email: user.email, name: user.name };
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

  const userId = user.id;

  try {
    // 1. Try to fetch fresh data from the DB
    const response = await fetch(`http://localhost:5000/api/users/${userId}/notes`);
    
    if (response.ok) {
      const dbMoods = await response.json();

      // 2. Sync the fresh DB data back to Local Storage
      const allMoods = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOODS) || '{}');
      allMoods[userId] = dbMoods;
      localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(allMoods));

      return dbMoods;
    }
  } catch (error) {
    console.warn("Could not fetch from DB, falling back to local storage:", error);
  }

  // 3. Fallback: Return what we have in Local Storage if DB fails
  const localData = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOODS) || '{}');
  return localData[userId] || [];
},

async addMood(score: number, note: string) {
  const user = await this.getCurrentUser();
  if (!user) throw new Error("No user logged in");

  // Use the ID coming from your database, not a crypto.randomUUID()
  const userId =  user.id; 

  const newMood = {
    // Let the Database generate the ID for the note itself
    timestamp: Date.now(),
    score,
    note
  };

  try {
    const response = await fetch(`http://localhost:5000/api/users/${userId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMood),
    });

    if (!response.ok) {
       const err = await response.json();
       throw new Error(err.error || 'Failed to save');
    }

    const savedMood = await response.json();

    // Update Local Storage
    const allMoods = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOODS) || '{}');
    if (!allMoods[userId]) allMoods[userId] = [];
    allMoods[userId].push(savedMood);
    localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(allMoods));

    return savedMood;
  } catch (error) {
    console.error("Sync Error:", error);
    throw error;
  }
}
};