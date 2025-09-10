// Mobile-specific auth service that avoids Node.js dependencies
import type { 
  LoginUserRequest, 
  RegisterUserRequest, 
  User,
  AuthResponse 

} from "@bitsacco/core/types";

export interface MobileAuthService {
  login: (credentials: LoginUserRequest) => Promise<AuthResponse>;
  register: (userData: RegisterUserRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  getRefreshToken: () => Promise<string | null>;
  setTokens: (access: string, refresh?: string) => Promise<void>;
  clearTokens: () => Promise<void>;
  isAuthenticated: () => Promise<boolean>;
}

class MobileAuthServiceImpl implements MobileAuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async login(credentials: LoginUserRequest): Promise<AuthResponse> {
    // For now, return mock data
    // In a real implementation, you'd make an API call to your backend
    const mockUser: User = {
      id: "mock-user-id",
      roles: [0], // Member role
      phone: credentials.phone ? {
        number: credentials.phone,
        verified: false,
      } : undefined,

    };

    const mockTokens = {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    };

    this.accessToken = mockTokens.accessToken;
    this.refreshToken = mockTokens.refreshToken;

    return {
      user: mockUser,
      accessToken: mockTokens.accessToken,
      refreshToken: mockTokens.refreshToken,
    };
  }

  async register(userData: RegisterUserRequest): Promise<AuthResponse> {
    // Mock registration - in real implementation, call your backend
    const mockUser: User = {
      id: "new-user-id",
      roles: userData.roles,
      phone: userData.phone ? {
        number: userData.phone,
        verified: false,
      } : undefined,

    };

    const mockTokens = {
      accessToken: "mock-access-token-new",
      refreshToken: "mock-refresh-token-new",
    };

    this.accessToken = mockTokens.accessToken;
    this.refreshToken = mockTokens.refreshToken;

    return {
      user: mockUser,
      accessToken: mockTokens.accessToken,
      refreshToken: mockTokens.refreshToken,
    };
  }

  async logout(): Promise<void> {
    await this.clearTokens();
  }

  async getAccessToken(): Promise<string | null> {
    // In a real implementation, you'd get this from AsyncStorage
    return this.accessToken;
  }

  async getRefreshToken(): Promise<string | null> {
    // In a real implementation, you'd get this from AsyncStorage
    return this.refreshToken;
  }

  async setTokens(access: string, refresh?: string): Promise<void> {
    this.accessToken = access;
    if (refresh) {
      this.refreshToken = refresh;
    }
    // In a real implementation, you'd store these in AsyncStorage
  }

  async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    // In a real implementation, you'd remove these from AsyncStorage
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }
}

export const mobileAuthService = new MobileAuthServiceImpl();
