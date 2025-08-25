export enum Role {
  Member = 0,
  Admin = 1,
  SuperAdmin = 3,
}

export interface LoginUserRequest {
  pin: string;
  phone?: string;
  npub?: string;
}

export interface RegisterUserRequest {
  pin: string;
  phone?: string;
  npub?: string;
  roles: Role[];
}

export interface VerifyUserRequest {
  phone?: string;
  npub?: string;
  otp?: string;
}

export interface RecoverUserRequest {
  pin: string;
  phone?: string;
  npub?: string;
  otp?: string;
}

export interface AuthRequest {
  accessToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RevokeTokenRequest {
  refreshToken: string;
}

export interface RevokeTokenResponse {
  success: boolean;
}

export interface User {
  id: string;
  phone?: Phone;
  nostr?: Nostr;
  profile?: Profile;
  roles: Role[];
}

export interface Phone {
  number: string;
  verified: boolean;
}

export interface Nostr {
  npub: string;
  verified: boolean;
}

export interface Profile {
  name?: string;
  avatarUrl?: string;
}

export interface UpdateUserRequest {
  userId: string;
  updates: UserUpdates;
}

export interface UserUpdates {
  phone?: Phone;
  nostr?: Nostr;
  profile?: Profile;
  roles: Role[];
}

export interface AuthTokenPayload {
  user: User;
  expires: Date;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  expires: Date;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
