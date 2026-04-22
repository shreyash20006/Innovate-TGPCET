import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';

// ─── Auth Store ─────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  profile: Profile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  love_streak: number;
  anniversary_date: string | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
    }),
    { name: 'syncbeat-auth' }
  )
);

// ─── Room Store ──────────────────────────────────────────────────────────────
export interface Room {
  id: string;
  code: string;
  name: string;
  created_by: string;
  partner_id: string | null;
}

interface RoomState {
  room: Room | null;
  partnerOnline: boolean;
  setRoom: (room: Room | null) => void;
  setPartnerOnline: (v: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  partnerOnline: false,
  setRoom: (room) => set({ room }),
  setPartnerOnline: (v) => set({ partnerOnline: v }),
}));

// ─── Player Store ────────────────────────────────────────────────────────────
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  duration: number;        // seconds
  source: 'spotify' | 'youtube' | 'local';
  sourceId: string;        // Spotify trackId / YouTube videoId / blob URL
  dedicated?: boolean;
  dedicatedBy?: string;
}

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  volume: number;          // 0–1, local only
  isSyncing: boolean;

  setQueue: (q: Track[]) => void;
  addToQueue: (t: Track) => void;
  removeFromQueue: (idx: number) => void;
  setCurrentIndex: (i: number) => void;
  setIsPlaying: (v: boolean) => void;
  setCurrentTime: (t: number) => void;
  setVolume: (v: number) => void;
  setIsSyncing: (v: boolean) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  currentTime: 0,
  volume: 0.8,
  isSyncing: false,

  setQueue: (queue) => set({ queue }),
  addToQueue: (track) => set((s) => ({ queue: [...s.queue, track] })),
  removeFromQueue: (idx) =>
    set((s) => ({ queue: s.queue.filter((_, i) => i !== idx) })),
  setCurrentIndex: (i) => set({ currentIndex: i }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setVolume: (v) => set({ volume: v }),
  setIsSyncing: (v) => set({ isSyncing: v }),
}));

// ─── Chat Store ──────────────────────────────────────────────────────────────
export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  content: string;
  created_at: string;
  type: 'text' | 'dedication' | 'emoji';
}

interface ChatState {
  messages: Message[];
  partnerTyping: boolean;
  addMessage: (m: Message) => void;
  setMessages: (m: Message[]) => void;
  setPartnerTyping: (v: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  partnerTyping: false,
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setMessages: (messages) => set({ messages }),
  setPartnerTyping: (v) => set({ partnerTyping: v }),
}));
