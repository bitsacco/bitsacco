/**
 * Main export file for web API client
 * Legacy API exports - types updated for compatibility
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-unresolved */
export { WebApiClient, createApiClient } from "./client";
export type { WebApiClientConfig } from "./client";

// Export individual services
export { AuthService } from "./auth-service";
export { ChamaService } from "./chama-service";
export { WalletService } from "./wallet-service";
export { PersonalService } from "./personal-service";
export { MembershipService } from "./membership-service";
export { LightningAddressService } from "./lightning-address-service";
export { FxService } from "./fx-service";
export { BaseApiClient } from "./base-client";
export type { ApiClientConfig } from "./base-client";

// Re-export types from core (these will remain in core)
export type {
  // Auth types
  User,
  AuthResponse,
  LoginUserRequest,
  RegisterUserRequest,
  VerifyUserRequest,
  RecoverUserRequest,
  UpdateUserRequest,
  RevokeTokenResponse,

  // Chama types
  // Chama, // Not available in core
  // ChamaMember, // Not available in core
  // ChamaTransaction, // Not available in core
  // ChamaDeposit, // Not available in core
  // ChamaWithdrawal, // Not available in core
  CreateChamaRequest,
  UpdateChamaRequest,
  // InviteMemberRequest, // Not available in core - use InviteMembersRequest
  // RemoveMemberRequest, // Not available in core
  // UpdateMemberRoleRequest, // Not available in core
  // CreateDepositRequest, // Not available in core
  // CreateWithdrawalRequest, // Not available in core
  // ApproveWithdrawalRequest, // Not available in core
  // RejectWithdrawalRequest, // Not available in core
  // ChamaStats, // Not available in core
  // ChamaTransactionType, // Not available in core
  // ChamaTransactionStatus, // Not available in core
  // ChamaInvite, // Not available in core

  // Wallet types
  // Wallet, // Not available in core
  // WalletBalance, // Not available in core
  // CreateWalletRequest, // Not available in core
  // UpdateWalletRequest, // Not available in core

  // Personal wallet types
  // PersonalWallet, // Not available in core
  // PersonalWalletDeposit, // Not available in core
  // PersonalWalletWithdrawal, // Not available in core
  // PersonalWalletTransaction, // Not available in core
  // PersonalWalletStats, // Not available in core
  // CreatePersonalWalletRequest, // Not available in core
  // UpdatePersonalWalletRequest, // Not available in core
  // CreatePersonalDepositRequest, // Not available in core
  // CreatePersonalWithdrawalRequest, // Not available in core

  // Membership types
  // MembershipShare, // Not available in core
  // ShareSubscriptionRequest, // Not available in core
  // ShareSubscriptionResponse, // Not available in core
  // SharePaymentIntent, // Not available in core
  // SharePayment, // Not available in core
  // ShareTransaction, // Not available in core
  // ShareTransfer, // Not available in core
  // CreateShareTransferRequest, // Not available in core
  // MembershipTier, // Not available in core
  // MembershipStats, // Not available in core

  // Lightning Address types
  LightningAddress,
  CreateLightningAddressDto,
  UpdateLightningAddressDto,
  ValidateLightningAddressResponse,
  // LightningAddressPaymentRequest, // Not available in core
  // LightningAddressPaymentResponse, // Not available in core
  // LnurlPayResponse, // Not available in core
  // LnurlWithdrawResponse, // Not available in core

  // FX types
  ExchangeRateData,
  // ExchangeRate, // Not available in core
  // ExchangeRateHistory, // Not available in core
  // ConvertCurrencyRequest, // Not available in core
  // ConvertCurrencyResponse, // Not available in core
  // SupportedCurrency, // Not available in core

  // Common types
  ApiResponse,
  ApiError,
  ValidationError,
  PaymentMethod,
  PaymentProvider,
  TransactionStatus,
} from "@bitsacco/core";
