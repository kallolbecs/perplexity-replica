import { create } from 'zustand';
import { Message } from './types';

interface ChatStore {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

interface ThemeStore {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ 
    // Keep only the last 10 conversations (20 messages, as each conversation has 2 messages)
    messages: [...state.messages.slice(-19), message]
  })),
  clearMessages: () => set({ messages: [] })
}));

export const useTheme = create<ThemeStore>((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'light' ? 'dark' : 'light' 
  }))
}));