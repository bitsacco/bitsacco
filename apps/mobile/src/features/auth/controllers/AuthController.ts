import { AppDispatch } from "../../../store";
import { loginUser, logoutUser, clearError } from "../store/authSlice";
import type { MobileRegisterRequest } from "../../../types/auth";

export class AuthController {
  private dispatch: AppDispatch;

  constructor(dispatch: AppDispatch) {
    this.dispatch = dispatch;
  }

  async login(email: string, password: string) {
    try {
      this.dispatch(clearError());
      const result = await this.dispatch(
        loginUser({ email, password })
      ).unwrap();
      return result;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async register(userData: MobileRegisterRequest) {
    try {
      // For now, we'll use the same login flow after registration
      // In a real app, you'd call the register API first

      // Mock registration for now - normally would call authApi.register
      // await authApi.register(userData);

      // After successful registration, automatically log the user in
      await this.login(userData.email, userData.password);

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  clearAuthError() {
    this.dispatch(clearError());
  }
}
