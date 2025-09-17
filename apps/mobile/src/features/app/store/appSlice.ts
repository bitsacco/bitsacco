import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import ThemeStorageService, { ThemeMode } from "../../../services/themeStorage";

export interface AppState {
  isLoading: boolean;
  isInitialized: boolean;
  theme: ThemeMode;
  themeLoaded: boolean;
  networkStatus: "online" | "offline";
  showPrivacyScreen: boolean;
}

// Async thunk to load theme from storage
export const loadThemeFromStorage = createAsyncThunk(
  "app/loadThemeFromStorage",
  async (): Promise<ThemeMode> => {
    return await ThemeStorageService.loadTheme();
  }
);

const initialState: AppState = {
  isLoading: true,
  isInitialized: false,
  theme: "dark", // Default theme before loading from storage
  themeLoaded: false,
  networkStatus: "online",
  showPrivacyScreen: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      state.themeLoaded = true;
    },
    setNetworkStatus: (state, action: PayloadAction<"online" | "offline">) => {
      state.networkStatus = action.payload;
    },
    initializeApp: (state) => {
      state.isLoading = false;
      state.isInitialized = true;
    },
    setPrivacyScreen: (state, action: PayloadAction<boolean>) => {
      state.showPrivacyScreen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadThemeFromStorage.pending, (state) => {
        state.themeLoaded = false;
      })
      .addCase(loadThemeFromStorage.fulfilled, (state, action) => {
        state.theme = action.payload;
        state.themeLoaded = true;
      })
      .addCase(loadThemeFromStorage.rejected, (state) => {
        // Keep default theme on error
        state.theme = "dark";
        state.themeLoaded = true;
      });
  },
});

export const {
  setLoading,
  setInitialized,
  setTheme,
  setNetworkStatus,
  initializeApp,
  setPrivacyScreen,
} = appSlice.actions;

export default appSlice.reducer;
