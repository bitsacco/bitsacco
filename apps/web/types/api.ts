/**
 * API request and response types specific to Next.js API routes
 * These extend the core types with additional fields needed for the Next.js app
 */

import type {
  PaymentIntentResponse,
  PaymentConfirmation,
  GetPaymentHistoryRequest,
  PaymentMethod,
  PaymentStatus,
} from "@bitsacco/core";

// API Error response
export interface ApiErrorResponse {
  error: string;
  details?: string;
  statusCode?: number;
}

// Payment Retry API types
export interface PaymentRetryResponse extends PaymentIntentResponse {
  retryCount: number;
  retryReason?: string;
}

export interface PaymentRetryInfoResponse {
  paymentIntentId: string;
  retryCount: number;
  maxRetries: number;
  canRetry: boolean;
  lastRetryAt?: string;
  nextRetryAt?: string;
  retryReason?: string;
}

// Payment History API types
export interface PaymentHistoryApiRequest
  extends Omit<GetPaymentHistoryRequest, "userId"> {
  userId?: string; // Optional in API since we can get it from session
}

// Payment Providers API types
export interface PaymentProvidersQuery {
  enabled?: "true" | "false";
  method?: PaymentMethod;
}

// Payment Status API types
export interface PaymentStatusResponse {
  paymentIntentId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  method: PaymentMethod;
  createdAt: string;
  updatedAt?: string;
  confirmation?: PaymentConfirmation;
  error?: string;
}

// Enhanced API request types with session context
export interface AuthenticatedApiRequest<T = unknown> {
  body: T;
  userId: string;
  sessionId?: string;
}

// Common pagination parameters for API endpoints
export interface PaginationParams {
  page?: number;
  size?: number;
}

// Date range filter parameters
export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

// Validation error response
export interface ValidationErrorResponse extends ApiErrorResponse {
  error: string;
  validationErrors?: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
}

// Success response wrapper
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  success: true;
  timestamp: string;
}

// Rate limit response
export interface RateLimitResponse extends ApiErrorResponse {
  error: "Rate limit exceeded";
  retryAfter: number;
  limit: number;
  remaining: number;
  resetTime: string;
}

// Health check response for payment services
export interface PaymentHealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  services: {
    [key: string]: {
      status: "up" | "down";
      responseTime?: number;
      lastChecked: string;
    };
  };
  timestamp: string;
}

// Webhook signature verification
export interface WebhookRequest {
  signature: string;
  payload: string;
  timestamp: string;
}

// Payment analytics types (if needed later)
export interface PaymentAnalyticsResponse {
  totalPayments: number;
  totalAmount: number;
  currency: string;
  successRate: number;
  averageAmount: number;
  paymentMethodBreakdown: Array<{
    method: PaymentMethod;
    count: number;
    totalAmount: number;
    successRate: number;
  }>;
  timeRange: {
    startDate: string;
    endDate: string;
  };
}
