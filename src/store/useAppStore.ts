import { create } from 'zustand';
import { DEFAULT_SERVER_URL } from '../constants/config';
import { getSetting, initializeDatabase, readSnapshot, setSetting } from '../services/database';
import type { HistoryEntry, Task } from '../types/task';

interface AppState {
  tasks: Task[];
  history: HistoryEntry[];
  phase: 'loading' | 'ready' | 'error';
  startupError: string | null;
  isDark: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  syncError: string | null;
  lastSync: string | null;
  serverUrl: string;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  setTheme: (isDark: boolean) => Promise<void>;
  setServerUrl: (url: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  tasks: [], history: [], phase: 'loading', startupError: null,
  isDark: false, isOnline: true, isSyncing: false, syncError: null, lastSync: null,
  serverUrl: DEFAULT_SERVER_URL,
  initialize: async () => {
    set({ phase: 'loading', startupError: null });
    try {
      await initializeDatabase();
      const snapshot = await readSnapshot();
      const isDark = (await getSetting('theme')) === 'dark';
      const serverUrl = (await getSetting('serverUrl')) ?? DEFAULT_SERVER_URL;
      const lastSync = (await getSetting('lastSync')) ?? null;
      set({ ...snapshot, isDark, serverUrl, lastSync, phase: 'ready' });
    } catch {
      set({ phase: 'error', startupError: 'Could not open local data. Your existing data has not been reset. Please retry.' });
    }
  },
  refresh: async () => set(await readSnapshot()),
  setTheme: async isDark => {
    await setSetting('theme', isDark ? 'dark' : 'light');
    set({ isDark });
  },
  setServerUrl: async url => {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
      throw new Error('Use an HTTP or HTTPS server address without credentials.');
    }
    const serverUrl = url.trim().replace(/\/+$/, '');
    await setSetting('serverUrl', serverUrl);
    set({ serverUrl, syncError: null });
  },
}));
