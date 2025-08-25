import type { PaginatedRequest } from "./lib";

export interface Share {
  id: string;
  chamaId: string;
  userId: string;
  amount: number;
  purchaseDate: Date;
  status: ShareStatus;
}

export enum ShareStatus {
  Pending = "pending",
  Active = "active",
  Transferred = "transferred",
  Redeemed = "redeemed",
}

export interface ShareOffer {
  id: string;
  chamaId: string;
  fromUserId: string;
  shareId: string;
  price: number;
  status: ShareOfferStatus;
  expiresAt?: Date;
  createdAt: Date;
}

export enum ShareOfferStatus {
  Active = "active",
  Accepted = "accepted",
  Cancelled = "cancelled",
  Expired = "expired",
}

export interface CreateShareOfferRequest {
  chamaId: string;
  shareId: string;
  price: number;
  expiresAt?: Date;
}

export interface AcceptShareOfferRequest {
  offerId: string;
}

export interface FilterShareOffersRequest {
  chamaId?: string;
  status?: ShareOfferStatus;
  pagination?: PaginatedRequest;
}

export interface UserSharesRequest {
  chamaId?: string;
  pagination?: PaginatedRequest;
}

export interface PurchaseSharesRequest {
  chamaId: string;
  quantity: number;
  totalAmount: number;
}
