import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_STORAGE_KEY = "@bitsacco_theme";

export type ThemeMode = "light" | "dark";

export class ThemeStorageService {
  /**
   * Save theme to AsyncStorage
   */
  static async saveTheme(theme: ThemeMode): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      console.log("Theme saved to storage:", theme);
    } catch (error) {
      console.error("Failed to save theme to storage:", error);
    }
  }

  /**
   * Load theme from AsyncStorage
   */
  static async loadTheme(): Promise<ThemeMode> {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "light" || savedTheme === "dark") {
        console.log("Theme loaded from storage:", savedTheme);
        return savedTheme;
      }
    } catch (error) {
      console.error("Failed to load theme from storage:", error);
    }

    // Default to dark theme if no saved theme or error
    console.log("Using default theme: dark");
    return "dark";
  }

  /**
   * Clear theme from AsyncStorage
   */
  static async clearTheme(): Promise<void> {
    try {
      await AsyncStorage.removeItem(THEME_STORAGE_KEY);
      console.log("Theme cleared from storage");
    } catch (error) {
      console.error("Failed to clear theme from storage:", error);
    }
  }

  /**
   * Get theme synchronously if already cached
   * This is useful for preventing flash during app startup
   */
  static getCachedTheme(): ThemeMode | null {
    // In React Native, we can't access AsyncStorage synchronously
    // This method will be used differently - we'll rely on Redux initial state
    return null;
  }
}

export default ThemeStorageService;
