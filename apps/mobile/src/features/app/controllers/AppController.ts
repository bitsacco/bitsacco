import { AppDispatch } from "../../../store";
import { initializeApp, setLoading } from "../store/appSlice";
import { mobileAuthService } from "../../../services/mobileAuthService";

export class AppController {
  private dispatch: AppDispatch;

  constructor(dispatch: AppDispatch) {
    this.dispatch = dispatch;
  }

  async initializeApp() {
    try {
      this.dispatch(setLoading(true));

      // Check for existing auth tokens
      const hasValidToken = await this.checkAuthenticationStatus();


      // Simulate some initialization time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Initialize app
      this.dispatch(initializeApp());
    } catch (error) {
      console.error("Failed to initialize app:", error);
      this.dispatch(setLoading(false));
    }
  }

  private async checkAuthenticationStatus(): Promise<boolean> {
    try {
      // Check if user has valid token
      const isAuth = await mobileAuthService.isAuthenticated();
      return isAuth;
    } catch (error) {
      console.error("Error checking auth status:", error);
      return false;
    }
  }

  switchTheme() {
    // Implementation for theme switching
    // This can be expanded later
  }
}
