import { AppState, AppStateStatus } from "react-native";

export type AppStateChangeListener = (state: AppStateStatus) => void;

export class PrivacyService {
  private static listeners: AppStateChangeListener[] = [];
  private static currentState: AppStateStatus = AppState.currentState;

  private static subscription: any = null;

  /**
   * Initialize the privacy service
   */
  static initialize() {
    this.subscription = AppState.addEventListener(
      "change",
      this.handleAppStateChange
    );
  }

  /**
   * Clean up the privacy service
   */
  static cleanup() {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  /**
   * Handle app state changes
   */
  private static handleAppStateChange = (nextAppState: AppStateStatus) => {
    console.log(
      "App state changed from",
      this.currentState,
      "to",
      nextAppState
    );

    // Notify all listeners
    this.listeners.forEach((listener) => {
      try {
        listener(nextAppState);
      } catch (error) {
        console.error("Error in app state listener:", error);
      }
    });

    this.currentState = nextAppState;
  };

  /**
   * Add a listener for app state changes
   */
  static addListener(listener: AppStateChangeListener): () => void {
    this.listeners.push(listener);

    // Return cleanup function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current app state
   */
  static getCurrentState(): AppStateStatus {
    return this.currentState;
  }

  /**
   * Check if app is in background/inactive (privacy mode should be active)
   */
  static shouldShowPrivacyScreen(): boolean {
    return (
      this.currentState === "background" || this.currentState === "inactive"
    );
  }

  /**
   * Check if app is active
   */
  static isAppActive(): boolean {
    return this.currentState === "active";
  }
}

export default PrivacyService;
