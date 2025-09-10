// store/slices/webviewSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WebViewState {
  isLoading: boolean;
  isConnected: boolean;
  refreshing: boolean;
  hasError: boolean;
  errorDetails: string;
  errorCode?: number;
  retryCount: number;
  isWebViewScrolled: boolean;
  currentUrl: string;
  canGoBack: boolean;
  canGoForward: boolean;
  lastUpdated: number;
  navigationHistory: string[];
}

const initialState: WebViewState = {
  isLoading: false,
  isConnected: true,
  refreshing: false,
  hasError: false,
  errorDetails: "",
  errorCode: undefined,
  retryCount: 0,
  isWebViewScrolled: false,
  currentUrl: "https://app.bitsacco.com/auth?q=login",
  canGoBack: false,
  canGoForward: false,
  lastUpdated: Date.now(),
  navigationHistory: [],
};

const webviewSlice = createSlice({
  name: "webview",
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.lastUpdated = Date.now();
    },

    setRefreshing: (state, action: PayloadAction<boolean>) => {
      state.refreshing = action.payload;
      state.lastUpdated = Date.now();
    },

    // Network connectivity
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      state.lastUpdated = Date.now();

      // Clear error if connection is restored
      if (action.payload && state.hasError) {
        state.hasError = false;
        state.errorDetails = "";
        state.errorCode = undefined;
      }
    },

    // Error handling
    setError: (
      state,
      action: PayloadAction<{
        hasError: boolean;
        errorDetails?: string;
        errorCode?: number;
      }>
    ) => {
      state.hasError = action.payload.hasError;
      state.errorDetails = action.payload.errorDetails || "";
      state.errorCode = action.payload.errorCode;
      state.isLoading = false;
      state.refreshing = false;
      state.lastUpdated = Date.now();
    },

    clearError: (state) => {
      state.hasError = false;
      state.errorDetails = "";
      state.errorCode = undefined;
      state.lastUpdated = Date.now();
    },

    incrementRetryCount: (state) => {
      state.retryCount += 1;
      state.lastUpdated = Date.now();
    },

    resetRetryCount: (state) => {
      state.retryCount = 0;
      state.lastUpdated = Date.now();
    },

    // Scroll state
    setWebViewScrolled: (state, action: PayloadAction<boolean>) => {
      state.isWebViewScrolled = action.payload;
    },

    // Navigation state
    setNavigationState: (
      state,
      action: PayloadAction<{
        url: string;
        canGoBack: boolean;
        canGoForward: boolean;
      }>
    ) => {
      state.currentUrl = action.payload.url;
      state.canGoBack = action.payload.canGoBack;
      state.canGoForward = action.payload.canGoForward;
      state.lastUpdated = Date.now();

      // Add to navigation history (keep last 10 entries)
      if (!state.navigationHistory.includes(action.payload.url)) {
        state.navigationHistory.unshift(action.payload.url);
        if (state.navigationHistory.length > 10) {
          state.navigationHistory = state.navigationHistory.slice(0, 10);
        }
      }
    },

    // Load states
    startLoading: (state) => {
      state.isLoading = true;
      state.hasError = false;
      state.errorDetails = "";
      state.errorCode = undefined;
      state.lastUpdated = Date.now();
    },

    finishLoading: (state) => {
      state.isLoading = false;
      state.refreshing = false;
      state.hasError = false;
      state.errorDetails = "";
      state.lastUpdated = Date.now();
    },

    // Refresh actions
    startRefresh: (state) => {
      state.refreshing = true;
      state.hasError = false;
      state.errorDetails = "";
      state.errorCode = undefined;
      state.lastUpdated = Date.now();
    },

    // Reset entire state
    resetWebViewState: (state) => {
      Object.assign(state, initialState);
      state.lastUpdated = Date.now();
    },

    // Update URL
    setCurrentUrl: (state, action: PayloadAction<string>) => {
      state.currentUrl = action.payload;
      state.lastUpdated = Date.now();
    },
  },
});

export const {
  setLoading,
  setRefreshing,
  setConnected,
  setError,
  clearError,
  incrementRetryCount,
  resetRetryCount,
  setWebViewScrolled,
  setNavigationState,
  startLoading,
  finishLoading,
  startRefresh,
  resetWebViewState,
  setCurrentUrl,
} = webviewSlice.actions;

export default webviewSlice.reducer;
