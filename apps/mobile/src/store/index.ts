import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import webviewReducer from '../features/webview/store/WebViewSlice';
// Import feature slices
import authReducer from "../features/auth/store/authSlice";
import appReducer from "../features/app/store/appSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    webview: webviewReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
