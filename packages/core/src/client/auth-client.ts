import { BaseApiClient } from "./base-client";
import type {
  LoginUserRequest,
  RegisterUserRequest,
  VerifyUserRequest,
  RecoverUserRequest,
  AuthResponse,
  TokensResponse,
  RevokeTokenResponse,
  UpdateUserRequest,
  User,
} from "../types/auth";
import type { ApiResponse } from "../types/lib";

export class AuthApiClient extends BaseApiClient {
  /**
   * Login user with phone/pin or npub/pin
   */
  async login(request: LoginUserRequest): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>("/auth/login", request);
  }

  /**
   * Register a new user
   */
  async register(
    request: RegisterUserRequest,
  ): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>("/auth/register", request);
  }

  /**
   * Verify a user with OTP
   */
  async verify(request: VerifyUserRequest): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>("/auth/verify", request);
  }

  /**
   * Initiate account recovery
   */
  async recover(
    request: RecoverUserRequest,
  ): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>("/auth/recover", request);
  }

  /**
   * Authenticate with existing token
   */
  async authenticate(): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>("/auth/authenticate");
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(
    refreshToken?: string,
  ): Promise<ApiResponse<TokensResponse>> {
    const body = refreshToken ? { refreshToken } : undefined;
    return this.post<TokensResponse>("/auth/refresh", body);
  }

  /**
   * Logout and revoke tokens
   */
  async logout(
    refreshToken?: string,
  ): Promise<ApiResponse<RevokeTokenResponse>> {
    const body = refreshToken ? { refreshToken } : undefined;
    return this.post<RevokeTokenResponse>("/auth/logout", body);
  }

  /**
   * Update user profile
   */
  async updateUser(request: UpdateUserRequest): Promise<ApiResponse<User>> {
    return this.put<User>(`/users/${request.userId}`, request.updates);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get<User>("/auth/me");
  }
}
