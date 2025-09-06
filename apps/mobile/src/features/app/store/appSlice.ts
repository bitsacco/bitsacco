import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AppState {
  isLoading: boolean;
  isInitialized: boolean;
  theme: "light" | "dark";
  networkStatus: "online" | "offline";
}

const initialState: AppState = {
  isLoading: true,
  isInitialized: false,
  theme: "dark",
  networkStatus: "online",
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
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    setNetworkStatus: (state, action: PayloadAction<"online" | "offline">) => {
      state.networkStatus = action.payload;
    },
    initializeApp: (state) => {
      state.isLoading = false;
      state.isInitialized = true;
    },
  },
});

export const {
  setLoading,
  setInitialized,
  setTheme,
  setNetworkStatus,
  initializeApp,
} = appSlice.actions;
export default appSlice.reducer;
