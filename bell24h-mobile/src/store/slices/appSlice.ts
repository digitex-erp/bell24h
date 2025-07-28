import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface AppSettings {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
  offlineMode: boolean;
}

interface AppState {
  settings: AppSettings;
  isOnline: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  settings: {
    theme: 'light',
    language: 'en',
    notifications: true,
    offlineMode: false,
  },
  isOnline: true,
  loading: false,
  error: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.settings.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.settings.language = action.payload;
    },
    toggleNotifications: (state) => {
      state.settings.notifications = !state.settings.notifications;
    },
    toggleOfflineMode: (state) => {
      state.settings.offlineMode = !state.settings.offlineMode;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
});

export const {
  setTheme,
  setLanguage,
  toggleNotifications,
  toggleOfflineMode,
  setOnlineStatus,
  setLoading,
  setError,
  clearError,
  updateSettings,
} = appSlice.actions;

export default appSlice.reducer; 