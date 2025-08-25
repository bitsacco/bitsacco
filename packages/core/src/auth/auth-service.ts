import { jwtVerify, type JWTPayload } from "jose";
import type { StorageAdapter } from "../adapters/storage";
import type {
  AuthResponse,
  TokensResponse,
  User,
  AuthTokenPayload,
} from "../types/auth";

export interface AuthServiceConfig {
  storage: StorageAdapter;
  jwtPublicKey?: string;
  apiBaseUrl?: string;
}

export class AuthService {
  private storage: StorageAdapter;
  private jwtPublicKey?: Uint8Array;
  private apiBaseUrl?: string;

  // Storage keys
  private readonly ACCESS_TOKEN_KEY = "bitsacco_access_token";
  private readonly REFRESH_TOKEN_KEY = "bitsacco_refresh_token";
  private readonly USER_KEY = "bitsacco_user";

  constructor(config: AuthServiceConfig) {
    this.storage = config.storage;
    this.apiBaseUrl = config.apiBaseUrl;

    if (config.jwtPublicKey) {
      this.jwtPublicKey = new TextEncoder().encode(config.jwtPublicKey);
    }
  }

  /**
   * Store authentication tokens and user data
   */
  async storeAuthData(authResponse: AuthResponse): Promise<void> {
    if (authResponse.accessToken) {
      await this.storage.setItem(
        this.ACCESS_TOKEN_KEY,
        authResponse.accessToken,
      );
    }

    if (authResponse.refreshToken) {
      await this.storage.setItem(
        this.REFRESH_TOKEN_KEY,
        authResponse.refreshToken,
      );
    }

    await this.storage.setItem(
      this.USER_KEY,
      JSON.stringify(authResponse.user),
    );
  }

  /**
   * Store tokens from token response
   */
  async storeTokens(tokens: TokensResponse): Promise<void> {
    await this.storage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    await this.storage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  /**
   * Get stored access token
   */
  async getAccessToken(): Promise<string | null> {
    return this.storage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return this.storage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get stored user data
   */
  async getUser(): Promise<User | null> {
    const userData = await this.storage.getItem(this.USER_KEY);
    if (!userData) return null;

    try {
      return JSON.parse(userData) as User;
    } catch {
      return null;
    }
  }

  /**
   * Verify and decode JWT token
   */
  async verifyToken(token: string): Promise<AuthTokenPayload | null> {
    if (!this.jwtPublicKey) {
      throw new Error("JWT public key not configured");
    }

    try {
      const { payload } = await jwtVerify(token, this.jwtPublicKey);

      // Validate the payload structure
      if (this.isValidAuthPayload(payload)) {
        return {
          user: payload.user,
          expires: new Date(payload.exp! * 1000),
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(payload: AuthTokenPayload): boolean {
    return payload.expires.getTime() <= Date.now();
  }

  /**
   * Check if user is authenticated (has valid non-expired token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    if (!token) return false;

    const payload = await this.verifyToken(token);
    if (!payload) return false;

    return !this.isTokenExpired(payload);
  }

  /**
   * Get authorization header for API requests
   */
  async getAuthHeader(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    if (!token) return {};

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Clear all authentication data
   */
  async logout(): Promise<void> {
    await Promise.all([
      this.storage.removeItem(this.ACCESS_TOKEN_KEY),
      this.storage.removeItem(this.REFRESH_TOKEN_KEY),
      this.storage.removeItem(this.USER_KEY),
    ]);
  }

  /**
   * Type guard to check if JWT payload is a valid auth payload
   */
  private isValidAuthPayload(
    payload: JWTPayload,
  ): payload is JWTPayload & { user: User } {
    return (
      payload &&
      typeof payload === "object" &&
      "user" in payload &&
      typeof payload.user === "object" &&
      payload.user !== null &&
      "id" in payload.user &&
      typeof payload.user.id === "string"
    );
  }
}
