// Auth types
export type {
  LoginUserRequest,
  RegisterUserRequest,
  VerifyUserRequest,
  RecoverUserRequest,
  AuthRequest,
  AuthResponse,
  RefreshTokenRequest,
  TokensResponse,
  RevokeTokenRequest,
  RevokeTokenResponse,
  User,
  Phone,
  Nostr,
  Profile,
  UpdateUserRequest,
  UserUpdates,
  AuthTokenPayload,
  RefreshTokenPayload,
  TokenResponse,
} from "./auth";

// Chama types
export type {
  Chama,
  ChamaMember,
  ChamaInvite,
  CreateChamaRequest,
  UpdateChamaRequest,
  ChamaUpdates,
  FindChamaRequest,
  FilterChamasRequest,
  PaginatedFilterChamasResponse,
  JoinChamaRequest,
  InviteMembersRequest,
  GetMemberProfilesRequest,
  MemberProfile,
  MemberProfilesResponse,
  // Chama Wallet types
  ChamaWalletTx,
  ChamaDepositRequest,
  ChamaContinueDepositRequest,
  ChamaWithdrawRequest,
  ChamaTxsFilterRequest,
  ChamaTxsResponse,
  ChamaTxUpdateRequest,
  ChamaTxMetaRequest,
  ChamaTxMetaResponse,
  BulkChamaTxMetaRequest,
  BulkChamaTxMetaResponse,
  ChamaTxGroupMeta,
  ChamaTxMemberMeta,
  ChamaMeta,
  MemberMeta,
  PaginatedChamaTxsResponse,
  ChamaTxContext,
  ChamaTxReview,
  ChamaTxUpdates,
  OnrampSwapSource,
  OfframpSwapTarget,
  ChamaDepositTarget,
  CreateTxContext,
  CreateMpesaDepositTx,
  CreateLightningDepositTx,
  CreateTxContextType,
  ActiveTx,
  isCreateMpesaDepositTx,
  isCreateLightningDepositTx,
  ChamaToTransactionState,
} from "./chama";

// Library types
export type {
  PaginatedRequest,
  ApiResponse,
  ValidationError,
  ValidationWarning,
  ApiError,
  PaginatedResponse,
  MobileMoney,
  Bolt11,
  FmLightning,
  LnUrlWithdrawPoint,
  OnrampSwapTarget,
  FindTxRequest,
} from "./lib";

// Re-export core enums
export { TransactionStatus, TransactionType, Currency } from "./lib";

// Membership types
export type {
  SharesOffer,
  SharesTx,
  SharesTxTransferMeta,
  UserShareTxsResponse,
  AllSharesOffers,
  OfferSharesRequest,
  SubscribeSharesRequest,
  TransferSharesRequest,
  UpdateSharesRequest,
  UserSharesTxsRequest,
  FindShareTxRequest,
  SharesTxUpdates,
  PaginatedUserSharesTxsResponse,
  AllSharesTxsResponse,
  ShareValidationRules,
  MembershipTier,
  SharesPaymentInfo,
  SharePurchaseValidation,
  UserEligibility,
  SharesAnalytics,
} from "./membership";

// Wallet types
export type {
  Transaction,
  CreateTransactionRequest,
  WalletBalance,
  GetTransactionsRequest,
  TransactionMetadata,
} from "./wallet";

// Exchange types
export type {
  QuoteRequest,
  QuoteResponse,
  ExchangeRateData,
  Quote,
  OnrampSwapRequest,
  OfframpSwapRequest,
  FindSwapRequest,
  SwapResponse,
  PaginatedSwapResponse,
} from "./exchange";

// Payment types
export type {
  PaymentProvider,
  PaymentFee,
  PaymentLimits,
  MpesaPaymentDetails,
  LightningPaymentDetails,
  BankTransferDetails,
  CardPaymentDetails,
  PaymentMethodDetails,
  PaymentIntent,
  PaymentRetryConfig,
  PaymentConfirmation,
  CreatePaymentIntentRequest,
  PaymentIntentResponse,
  PaymentInstructions,
  ProcessPaymentRequest,
  RetryPaymentRequest,
  GetPaymentHistoryRequest,
  PaymentHistoryResponse,
  PaymentMetadata,
  UssdInstructionData,
  QrInstructionData,
  RedirectInstructionData,
  ManualInstructionData,
  PaymentInstructionData,
  MpesaConfirmation,
  LightningConfirmation,
  BankTransferConfirmation,
  CardConfirmation,
  PaymentConfirmationData,
} from "./payments";

// Personal Savings types
export type {
  CreateWalletDto,
  UpdateWalletDto,
  WalletResponseDto,
  WalletListResponseDto,
  TargetResponseDto,
  LockedWalletResponseDto,
  WalletTransaction,
  TransactionHistoryResponse,
  WalletQueryDto,
  WalletConfig,
  TargetWalletConfig,
  LockedWalletConfig,
  WalletProgress,
  LockInfo,
  UpdateTargetDto,
  UpdateLockedWalletDto,
  EarlyWithdrawDto,
  RenewLockDto,
  TargetProgressResponseDto,
  LockStatusResponseDto,
  EarlyWithdrawResponseDto,
  WalletAnalyticsDto,
  UserAnalyticsDto,
  DepositWithdrawResponseDto,
  // Backend API types
  SolowalletTx,
  PaginatedSolowalletTxsResponse,
  WalletMeta,
  UserTxsResponse,
} from "./personal";

// Personal Savings utility functions
export {
  mapTransactionTypeToFrontend,
  mapTransactionStatusToFrontend,
} from "./personal";

// Re-export enums
export { Role } from "./auth";
export {
  ChamaMemberRole,
  ChamaTxStatus,
  Review,
  TransactionType as ChamaTransactionType,
} from "./chama";
export { SharesTxStatus, SharesTxType } from "./membership";
export {
  TransactionType as WalletTransactionType,
  TransactionStatus as WalletTransactionStatus,
} from "./wallet";
export {
  SATS_PER_BTC,
  MSATS_PER_BTC,
  DEFAULT_REFRESH_INTERVAL,
} from "./exchange";
export { PaymentMethod, PaymentStatus } from "./payments";
export {
  WalletType,
  LockPeriod,
  TransactionType as PersonalTransactionType,
  TransactionStatus as PersonalTransactionStatus,
} from "./personal";
