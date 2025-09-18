import { Middleware } from "@reduxjs/toolkit";
import { setTheme } from "../../features/app/store/appSlice";
import ThemeStorageService from "../../services/themeStorage";

/**
 * Redux middleware that persists theme changes to AsyncStorage
 */
export const themeMiddleware: Middleware =
  (store) => (next) => (action: unknown) => {
    // Call the next middleware/reducer first
    const result = next(action);

    // Check if the action is a theme change
    if (
      action &&
      typeof action === "object" &&
      "type" in action &&
      action.type === setTheme.type &&
      "payload" in action
    ) {
      // Persist the new theme to storage asynchronously
      const themeAction = action as { payload: any };
      ThemeStorageService.saveTheme(themeAction.payload).catch((error) => {
        console.error("Failed to persist theme change:", error);
      });
    }

    return result;
  };

export default themeMiddleware;
