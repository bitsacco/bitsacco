import type { PaginatedRequest } from "./lib";

export enum ChamaMemberRole {
  Member = 0,
  Admin = 1,
  ExternalAdmin = 3,
  UNRECOGNIZED = -1,
}

export interface Chama {
  id: string;
  name: string;
  description?: string | undefined;
  members: ChamaMember[];
  /** User ID of member creating the chama */
  createdBy: string;
}

export interface ChamaMember {
  userId: string;
  roles: ChamaMemberRole[];
}

export interface ChamaInvite {
  phoneNumber?: string | undefined;
  nostrNpub?: string | undefined;
  roles: ChamaMemberRole[];
}

export interface CreateChamaRequest {
  name: string;
  description?: string | undefined;
  members: ChamaMember[];
  invites: ChamaInvite[];
  createdBy: string;
}

export interface UpdateChamaRequest {
  chamaId: string;
  updates: ChamaUpdates | undefined;
}

export interface ChamaUpdates {
  name?: string | undefined;
  description?: string | undefined;
  addMembers: ChamaMember[];
  updateMembers: ChamaMember[];
}

export interface FindChamaRequest {
  chamaId: string;
}

export interface FilterChamasRequest {
  createdBy?: string | undefined;
  memberId?: string | undefined;
  pagination?: PaginatedRequest | undefined;
}

export interface PaginatedFilterChamasResponse {
  chamas: Chama[];
  /** Current page offset */
  page: number;
  /** Number of items return per page */
  size: number;
  /** Number of pages given the current page size */
  pages: number;
  /** Total number of items across all pages */
  total: number;
}

export interface JoinChamaRequest {
  chamaId: string;
  memberInfo: ChamaMember | undefined;
}

export interface InviteMembersRequest {
  chamaId: string;
  invites: ChamaInvite[];
}

export interface GetMemberProfilesRequest {
  chamaId: string;
}

export interface MemberProfile {
  userId: string;
  roles: ChamaMemberRole[];
  name?: string | undefined;
  avatarUrl?: string | undefined;
  phoneNumber?: string | undefined;
  nostrNpub?: string | undefined;
}

export interface MemberProfilesResponse {
  members: MemberProfile[];
}

// Chama Wallet Types
export enum ChamaTxStatus {
  PENDING = 0,
  PROCESSING = 1,
  FAILED = 2,
  COMPLETE = 3,
  APPROVED = 4,
  REJECTED = 5,
  UNRECOGNIZED = -1,
}

export enum Review {
  REJECT = 0,
  APPROVE = 1,
  UNRECOGNIZED = -1,
}

export enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAWAL = "withdrawal",
  TRANSFER = "transfer",
  UNRECOGNIZED = "unrecognized",
}

export interface OnrampSwapSource {
  currency: string;
  origin: {
    phone?: string;
  };
}

export interface OfframpSwapTarget {
  currency: string;
  destination: {
    phone?: string;
    bankAccount?: string;
  };
}

export interface Bolt11 {
  paymentRequest: string;
  description?: string;
  amountMsats?: number;
}

export interface FmLightning {
  bolt11?: Bolt11;
  preimage?: string;
  paymentHash?: string;
  description?: string;
  amountMsats?: number;
}

export interface ChamaTxContext {
  sharesSubscriptionTracker?: string;
}

export interface ChamaTxReview {
  memberId: string;
  review: Review;
}

export interface ChamaWalletTx {
  id: string;
  memberId: string;
  chamaId: string;
  status: ChamaTxStatus;
  amountMsats: number;
  amountFiat?: number;
  lightning?: FmLightning;
  type: TransactionType;
  reviews: ChamaTxReview[];
  reference: string;
  createdAt: string;
  updatedAt?: string;
  context?: ChamaTxContext;
}

export interface ChamaDepositRequest {
  memberId: string;
  chamaId: string;
  amountFiat: number;
  reference?: string;
  onramp?: OnrampSwapSource;
  context?: ChamaTxContext;
  pagination?: PaginatedRequest;
}

export interface ChamaContinueDepositRequest {
  chamaId: string;
  txId: string;
  amountFiat: number;
  reference?: string;
  onramp?: OnrampSwapSource;
  pagination?: PaginatedRequest;
}

export interface ChamaWithdrawRequest {
  memberId: string;
  chamaId: string;
  amountFiat: number;
  reference?: string;
  pagination?: PaginatedRequest;
}

export interface ChamaTxsFilterRequest {
  memberId?: string;
  chamaId?: string;
  pagination?: PaginatedRequest;
}

export interface ChamaTxGroupMeta {
  groupDeposits: number;
  groupWithdrawals: number;
  groupBalance: number;
}

export interface ChamaTxMemberMeta {
  memberDeposits: number;
  memberWithdrawals: number;
  memberBalance: number;
}

export interface PaginatedChamaTxsResponse {
  transactions: ChamaWalletTx[];
  page: number;
  size: number;
  pages: number;
}

export interface ChamaTxsResponse {
  txId?: string;
  ledger?: PaginatedChamaTxsResponse;
  groupMeta?: ChamaTxGroupMeta;
  memberMeta?: ChamaTxMemberMeta;
}

export interface ChamaTxUpdates {
  status?: ChamaTxStatus;
  amountMsats?: number;
  reviews: ChamaTxReview[];
  reference?: string;
}

export interface ChamaTxUpdateRequest {
  chamaId: string;
  txId: string;
  updates?: ChamaTxUpdates;
  pagination?: PaginatedRequest;
}

export interface ChamaTxMetaRequest {
  chamaId: string;
  selectMemberIds: string[];
  skipMemberMeta?: boolean;
}

export interface MemberMeta {
  memberId: string;
  memberMeta?: ChamaTxMemberMeta;
}

export interface ChamaMeta {
  chamaId: string;
  groupMeta?: ChamaTxGroupMeta;
  memberMeta: MemberMeta[];
}

export interface ChamaTxMetaResponse {
  meta?: ChamaMeta;
}

export interface BulkChamaTxMetaRequest {
  chamaIds: string[];
  selectMemberIds: string[];
  skipMemberMeta?: boolean;
}

export interface BulkChamaTxMetaResponse {
  meta: ChamaMeta[];
}

// Additional types for transaction flow
export interface ChamaDepositTarget {
  target: {
    id: string;
    name?: string;
  };
  sharesSubscriptionTracker: string;
}

export interface CreateTxContext {
  path: string;
  amount?: number;
}

export interface CreateMpesaDepositTx extends CreateTxContext {
  phone?: string;
}

export interface CreateLightningDepositTx extends CreateTxContext {
  // Lightning specific fields if needed
  invoiceRequest?: string;
}

export type CreateTxContextType =
  | CreateMpesaDepositTx
  | CreateLightningDepositTx;

export interface ActiveTx {
  path: string;
  id: string;
  type: TransactionType;
  lightning?: FmLightning;
  state: ChamaTxStatus;
}

// Type guards
export function isCreateMpesaDepositTx(
  context: CreateTxContext,
): context is CreateMpesaDepositTx {
  return "phone" in context;
}

export function isCreateLightningDepositTx(
  context: CreateTxContext,
): context is CreateLightningDepositTx {
  return !("phone" in context) && context.path === "lightning";
}

// Transaction state mapping
export function ChamaToTransactionState(status: ChamaTxStatus): ChamaTxStatus {
  switch (status) {
    case ChamaTxStatus.PENDING:
      return ChamaTxStatus.PENDING;
    case ChamaTxStatus.PROCESSING:
      return ChamaTxStatus.PROCESSING;
    case ChamaTxStatus.APPROVED:
      return ChamaTxStatus.APPROVED;
    case ChamaTxStatus.COMPLETE:
      return ChamaTxStatus.COMPLETE;
    case ChamaTxStatus.FAILED:
      return ChamaTxStatus.FAILED;
    case ChamaTxStatus.REJECTED:
      return ChamaTxStatus.REJECTED;
    default:
      return ChamaTxStatus.UNRECOGNIZED;
  }
}
