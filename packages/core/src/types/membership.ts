// Based on OS API structure
export enum SharesTxStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

export enum SharesTxType {
  SUBSCRIPTION = "subscription",
  TRANSFER = "transfer",
  OFFER = "offer",
}

export interface SharesOffer {
  id: string;
  quantity: number;
  availableFrom: string;
  availableTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharesTx {
  id: string;
  userId: string;
  offerId?: string;
  quantity: number;
  type: SharesTxType;
  status: SharesTxStatus;
  transfer?: SharesTxTransferMeta;
  createdAt: string;
  updatedAt: string;
}

export interface SharesTxTransferMeta {
  fromUserId: string;
  toUserId: string;
  quantity: number;
}

export interface UserShareTxsResponse {
  transactions: SharesTx[];
  totalCount: number;
  page: number;
  size: number;
  pages?: number;
  totalShares?: number; // Total shares held by the user
}

export interface AllSharesOffers {
  offers: SharesOffer[];
  totalCount: number;
}

// Request types
export interface OfferSharesRequest {
  quantity: number;
  availableFrom: string;
  availableTo: string;
}

export interface SubscribeSharesRequest {
  userId: string;
  offerId: string;
  quantity: number;
}

export interface TransferSharesRequest {
  fromUserId: string;
  toUserId: string;
  sharesId: string;
  quantity: number;
}

export interface UpdateSharesRequest {
  sharesId: string;
  updates: {
    quantity?: number;
    status?: SharesTxStatus;
    transfer?: SharesTxTransferMeta;
    offerId?: string;
  };
}

export interface UserSharesTxsRequest {
  userId: string;
  page?: number;
  size?: number;
}

export interface FindShareTxRequest {
  sharesId: string;
}
