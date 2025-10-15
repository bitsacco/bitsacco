// Mobile-specific auth service that avoids Node.js dependencies
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  LoginUserRequest,
  RegisterUserRequest,
  VerifyUserRequest,
  RecoverUserRequest,
  User,
  AuthResponse,
} from "@bitsacco/core";

export interface MobileAuthService {
  login: (credentials: LoginUserRequest) => Promise<AuthResponse>;
  register: (userData: RegisterUserRequest) => Promise<AuthResponse>;
  verify: (request: VerifyUserRequest) => Promise<AuthResponse>;
  recover: (request: RecoverUserRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  setTokens: (access: string, refresh?: string) => Promise<void>;
  clearTokens: () => Promise<void>;
  isAuthenticated: () => Promise<boolean>;
  getCurrentUser: () => Promise<User | null>;
}

class MobileAuthServiceImpl implements MobileAuthService {
  private readonly API_URL =
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";
  private readonly ACCESS_TOKEN_KEY = "bitsacco_access_token";
  private readonly REFRESH_TOKEN_KEY = "bitsacco_refresh_token";
  private readonly USER_KEY = "bitsacco_user";

  async login(credentials: LoginUserRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const authResponse: AuthResponse = await response.json();

      // Store tokens and user data
      if (authResponse.accessToken) {
        await this.setTokens(
          authResponse.accessToken,
          authResponse.refreshToken
        );
      }
      if (authResponse.user) {
        await AsyncStorage.setItem(
          this.USER_KEY,
          JSON.stringify(authResponse.user)
        );
      }

      return authResponse;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async register(userData: RegisterUserRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Registration failed: ${response.statusText}`);
      }

      const authResponse: AuthResponse = await response.json();

      // Store user data (registration may not return tokens immediately)
      if (authResponse.user) {
        await AsyncStorage.setItem(
          this.USER_KEY,
          JSON.stringify(authResponse.user)
        );
      }
      if (authResponse.accessToken) {
        await this.setTokens(
          authResponse.accessToken,
          authResponse.refreshToken
        );
      }

      return authResponse;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async verify(request: VerifyUserRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`);
      }

      const authResponse: AuthResponse = await response.json();

      // Store tokens and user data
      if (authResponse.accessToken) {
        await this.setTokens(
          authResponse.accessToken,
          authResponse.refreshToken
        );
      }
      if (authResponse.user) {
        await AsyncStorage.setItem(
          this.USER_KEY,
          JSON.stringify(authResponse.user)
        );
      }

      return authResponse;
    } catch (error) {
      console.error("Verification error:", error);
      throw error;
    }
  }

  async recover(request: RecoverUserRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.API_URL}/auth/recover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Recovery failed: ${response.statusText}`);
      }

      const authResponse: AuthResponse = await response.json();

      // Store tokens and user data
      if (authResponse.accessToken) {
        await this.setTokens(
          authResponse.accessToken,
          authResponse.refreshToken
        );
      }
      if (authResponse.user) {
        await AsyncStorage.setItem(
          this.USER_KEY,
          JSON.stringify(authResponse.user)
        );
      }

      return authResponse;
    } catch (error) {
      console.error("Recovery error:", error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await fetch(`${this.API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local tokens regardless of API call success
      await this.clearTokens();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await this.getAccessToken();
      if (!token) return null;

      const response = await fetch(`${this.API_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, clear local storage
          await this.clearTokens();
        }
        return null;
      }

      const user: User = await response.json();
      // Update cached user data
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
      return user;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  }

  async setTokens(access: string, refresh?: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.ACCESS_TOKEN_KEY, access);
      if (refresh) {
        await AsyncStorage.setItem(this.REFRESH_TOKEN_KEY, refresh);
      }
    } catch (error) {
      console.error("Error setting tokens:", error);
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.ACCESS_TOKEN_KEY,
        this.REFRESH_TOKEN_KEY,
        this.USER_KEY,
      ]);
    } catch (error) {
      console.error("Error clearing tokens:", error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}

export const mobileAuthService = new MobileAuthServiceImpl();
