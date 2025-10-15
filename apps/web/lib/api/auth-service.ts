/**
 * Authentication service for web application
 */
import { BaseApiClient } from "./base-client";
import type {
  LoginUserRequest,
  RegisterUserRequest,
  VerifyUserRequest,
  RecoverUserRequest,
  AuthResponse,
  RevokeTokenResponse,
  UpdateUserRequest,
  User,
  ApiResponse,
} from "@bitsacco/core";

export class AuthService extends BaseApiClient {
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
   * Uses cookies/headers automatically - no body needed
   */
  async authenticate(): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>("/auth/authenticate");
  }

  /**
   * Refresh access token using refresh token from cookies
   * Backend uses cookies automatically - no body needed
   */
  async refreshToken(): Promise<
    ApiResponse<{ success: boolean; message: string }>
  > {
    return this.post<{ success: boolean; message: string }>("/auth/refresh");
  }

  /**
   * Logout and revoke tokens
   * Uses cookies automatically - no body needed
   */
  async logout(): Promise<ApiResponse<RevokeTokenResponse>> {
    return this.post<RevokeTokenResponse>("/auth/logout");
  }

  /**
   * Update user profile
   * Uses PATCH for partial updates
   */
  async updateUser(request: UpdateUserRequest): Promise<ApiResponse<User>> {
    return this.patch<User>(`/users/${request.userId}`, request.updates);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get<User>("/auth/me");
  }
}
