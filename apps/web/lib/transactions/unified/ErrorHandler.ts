/**
 * Transaction Error Handler
 * Centralized error handling for transaction operations with user-friendly messages
 */

import type { TransactionContext, TransactionType } from "./types";

// ============================================================================
// Error Types
// ============================================================================

export enum TransactionErrorCode {
  // Network and API errors
  NETWORK_ERROR = "NETWORK_ERROR",
  API_ERROR = "API_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  AUTH_ERROR = "AUTH_ERROR",

  // Validation errors
  INVALID_AMOUNT = "INVALID_AMOUNT",
  AMOUNT_TOO_LOW = "AMOUNT_TOO_LOW",
  AMOUNT_TOO_HIGH = "AMOUNT_TOO_HIGH",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  INVALID_PAYMENT_METHOD = "INVALID_PAYMENT_METHOD",
  INVALID_PHONE_NUMBER = "INVALID_PHONE_NUMBER",

  // Business logic errors
  WALLET_NOT_FOUND = "WALLET_NOT_FOUND",
  CHAMA_NOT_FOUND = "CHAMA_NOT_FOUND",
  PERMISSION_DENIED = "PERMISSION_DENIED",
  TRANSACTION_NOT_FOUND = "TRANSACTION_NOT_FOUND",
  ALREADY_REVIEWED = "ALREADY_REVIEWED",
  CANNOT_APPROVE_OWN = "CANNOT_APPROVE_OWN",
  WALLET_LOCKED = "WALLET_LOCKED",
  SHARES_UNAVAILABLE = "SHARES_UNAVAILABLE",

  // Payment errors
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_DECLINED = "PAYMENT_DECLINED",
  PAYMENT_TIMEOUT = "PAYMENT_TIMEOUT",
  INSUFFICIENT_MPESA_BALANCE = "INSUFFICIENT_MPESA_BALANCE",
  LIGHTNING_INVOICE_EXPIRED = "LIGHTNING_INVOICE_EXPIRED",

  // System errors
  SYSTEM_MAINTENANCE = "SYSTEM_MAINTENANCE",
  RATE_LIMITED = "RATE_LIMITED",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface TransactionError {
  code: TransactionErrorCode;
  message: string;
  details?: Record<string, unknown>;
  context?: TransactionContext;
  type?: TransactionType;
  timestamp: Date;
  recoverable: boolean;
  retryAfter?: number; // seconds
}

// ============================================================================
// Error Messages
// ============================================================================

const ERROR_MESSAGES: Record<TransactionErrorCode, string> = {
  // Network and API errors
  [TransactionErrorCode.NETWORK_ERROR]:
    "Network connection failed. Please check your internet connection and try again.",
  [TransactionErrorCode.API_ERROR]:
    "Service temporarily unavailable. Please try again in a few moments.",
  [TransactionErrorCode.TIMEOUT_ERROR]: "Request timed out. Please try again.",
  [TransactionErrorCode.AUTH_ERROR]:
    "Authentication failed. Please sign in again.",

  // Validation errors
  [TransactionErrorCode.INVALID_AMOUNT]: "Please enter a valid amount.",
  [TransactionErrorCode.AMOUNT_TOO_LOW]: "Amount is below the minimum limit.",
  [TransactionErrorCode.AMOUNT_TOO_HIGH]: "Amount exceeds the maximum limit.",
  [TransactionErrorCode.INSUFFICIENT_BALANCE]:
    "Insufficient balance for this transaction.",
  [TransactionErrorCode.INVALID_PAYMENT_METHOD]:
    "Selected payment method is not available.",
  [TransactionErrorCode.INVALID_PHONE_NUMBER]:
    "Please enter a valid phone number.",

  // Business logic errors
  [TransactionErrorCode.WALLET_NOT_FOUND]:
    "Wallet not found. Please select a different wallet.",
  [TransactionErrorCode.CHAMA_NOT_FOUND]:
    "Chama not found. Please check the chama details.",
  [TransactionErrorCode.PERMISSION_DENIED]:
    "You don't have permission to perform this action.",
  [TransactionErrorCode.TRANSACTION_NOT_FOUND]: "Transaction not found.",
  [TransactionErrorCode.ALREADY_REVIEWED]:
    "You have already reviewed this transaction.",
  [TransactionErrorCode.CANNOT_APPROVE_OWN]:
    "You cannot approve your own withdrawal request.",
  [TransactionErrorCode.WALLET_LOCKED]:
    "This wallet is locked and cannot be used for withdrawals.",
  [TransactionErrorCode.SHARES_UNAVAILABLE]:
    "Shares are no longer available for subscription.",

  // Payment errors
  [TransactionErrorCode.PAYMENT_FAILED]:
    "Payment failed. Please try again or use a different payment method.",
  [TransactionErrorCode.PAYMENT_DECLINED]:
    "Payment was declined. Please check your payment details.",
  [TransactionErrorCode.PAYMENT_TIMEOUT]:
    "Payment timed out. Please try again.",
  [TransactionErrorCode.INSUFFICIENT_MPESA_BALANCE]:
    "Insufficient M-Pesa balance. Please top up and try again.",
  [TransactionErrorCode.LIGHTNING_INVOICE_EXPIRED]:
    "Lightning invoice has expired. Please try again.",

  // System errors
  [TransactionErrorCode.SYSTEM_MAINTENANCE]:
    "System is under maintenance. Please try again later.",
  [TransactionErrorCode.RATE_LIMITED]:
    "Too many requests. Please wait before trying again.",
  [TransactionErrorCode.UNKNOWN_ERROR]:
    "An unexpected error occurred. Please try again.",
};

// ============================================================================
// Error Handler Class
// ============================================================================

export class TransactionErrorHandler {
  /**
   * Parse and classify an error from any source
   */
  static parseError(
    error: unknown,
    context?: TransactionContext,
    type?: TransactionType,
  ): TransactionError {
    const timestamp = new Date();

    // Handle API response errors
    if (error && typeof error === 'object' && 'response' in error) {
      const errorWithResponse = error as { response?: { data?: unknown } };
      if (errorWithResponse.response?.data) {
        const apiError = errorWithResponse.response.data;
        return this.handleApiError(apiError, context, type, timestamp);
      }
    }

    // Handle network errors
    const errorObj = error as { code?: string; message?: string; details?: unknown };
    if (
      errorObj?.code === "NETWORK_ERROR" ||
      (typeof errorObj?.message === 'string' && errorObj.message.includes("Network"))
    ) {
      return {
        code: TransactionErrorCode.NETWORK_ERROR,
        message: ERROR_MESSAGES[TransactionErrorCode.NETWORK_ERROR],
        context,
        type,
        timestamp,
        recoverable: true,
        retryAfter: 5,
      };
    }

    // Handle timeout errors
    if (errorObj?.code === "TIMEOUT" || (typeof errorObj?.message === 'string' && errorObj.message.includes("timeout"))) {
      return {
        code: TransactionErrorCode.TIMEOUT_ERROR,
        message: ERROR_MESSAGES[TransactionErrorCode.TIMEOUT_ERROR],
        context,
        type,
        timestamp,
        recoverable: true,
        retryAfter: 3,
      };
    }

    // Handle known error codes
    if (
      errorObj?.code &&
      Object.values(TransactionErrorCode).includes(errorObj.code as TransactionErrorCode)
    ) {
      return {
        code: errorObj.code as TransactionErrorCode,
        message: ERROR_MESSAGES[errorObj.code as TransactionErrorCode] || errorObj.message || '',
        details: typeof errorObj.details === 'object' && errorObj.details !== null ? errorObj.details as Record<string, unknown> : undefined,
        context,
        type,
        timestamp,
        recoverable: this.isRecoverable(errorObj.code as TransactionErrorCode),
        retryAfter: this.getRetryDelay(errorObj.code as TransactionErrorCode),
      };
    }

    // Default unknown error
    return {
      code: TransactionErrorCode.UNKNOWN_ERROR,
      message:
        (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: unknown }).message === 'string' ? (error as { message: string }).message : null) || ERROR_MESSAGES[TransactionErrorCode.UNKNOWN_ERROR],
      details: typeof error === 'object' && error !== null ? error as Record<string, unknown> : undefined,
      context,
      type,
      timestamp,
      recoverable: true,
      retryAfter: 5,
    };
  }

  /**
   * Handle API-specific errors
   */
  private static handleApiError(
    apiError: unknown,
    context?: TransactionContext,
    type?: TransactionType,
    timestamp: Date = new Date(),
  ): TransactionError {
    // Map common API error patterns
    const errorPatterns = [
      {
        pattern: /insufficient.*balance/i,
        code: TransactionErrorCode.INSUFFICIENT_BALANCE,
      },
      {
        pattern: /wallet.*not.*found/i,
        code: TransactionErrorCode.WALLET_NOT_FOUND,
      },
      {
        pattern: /chama.*not.*found/i,
        code: TransactionErrorCode.CHAMA_NOT_FOUND,
      },
      {
        pattern: /permission.*denied|unauthorized/i,
        code: TransactionErrorCode.PERMISSION_DENIED,
      },
      {
        pattern: /already.*reviewed/i,
        code: TransactionErrorCode.ALREADY_REVIEWED,
      },
      {
        pattern: /wallet.*locked/i,
        code: TransactionErrorCode.WALLET_LOCKED,
      },
      {
        pattern: /payment.*failed/i,
        code: TransactionErrorCode.PAYMENT_FAILED,
      },
      {
        pattern: /rate.*limit/i,
        code: TransactionErrorCode.RATE_LIMITED,
      },
    ];

    const apiErrorObj = apiError as { message?: string; error?: string; status?: number; statusCode?: number };
    const errorMessage = apiErrorObj.message || apiErrorObj.error || "";

    for (const { pattern, code } of errorPatterns) {
      if (pattern.test(errorMessage)) {
        return {
          code,
          message: ERROR_MESSAGES[code],
          details: typeof apiError === 'object' && apiError !== null ? apiError as Record<string, unknown> : undefined,
          context,
          type,
          timestamp,
          recoverable: this.isRecoverable(code),
          retryAfter: this.getRetryDelay(code),
        };
      }
    }

    // Handle HTTP status codes
    const status = apiErrorObj.status || apiErrorObj.statusCode;
    if (status) {
      const code = this.getErrorCodeFromStatus(status);
      return {
        code,
        message: ERROR_MESSAGES[code],
        details: typeof apiError === 'object' && apiError !== null ? apiError as Record<string, unknown> : undefined,
        context,
        type,
        timestamp,
        recoverable: this.isRecoverable(code),
        retryAfter: this.getRetryDelay(code),
      };
    }

    // Default API error
    return {
      code: TransactionErrorCode.API_ERROR,
      message: errorMessage || ERROR_MESSAGES[TransactionErrorCode.API_ERROR],
      details: typeof apiError === 'object' && apiError !== null ? apiError as Record<string, unknown> : undefined,
      context,
      type,
      timestamp,
      recoverable: true,
      retryAfter: 10,
    };
  }

  /**
   * Map HTTP status codes to error codes
   */
  private static getErrorCodeFromStatus(status: number): TransactionErrorCode {
    switch (status) {
      case 400:
        return TransactionErrorCode.INVALID_AMOUNT;
      case 401:
        return TransactionErrorCode.AUTH_ERROR;
      case 403:
        return TransactionErrorCode.PERMISSION_DENIED;
      case 404:
        return TransactionErrorCode.TRANSACTION_NOT_FOUND;
      case 429:
        return TransactionErrorCode.RATE_LIMITED;
      case 503:
        return TransactionErrorCode.SYSTEM_MAINTENANCE;
      default:
        return TransactionErrorCode.API_ERROR;
    }
  }

  /**
   * Check if an error is recoverable
   */
  private static isRecoverable(code: TransactionErrorCode): boolean {
    const nonRecoverableErrors = [
      TransactionErrorCode.PERMISSION_DENIED,
      TransactionErrorCode.ALREADY_REVIEWED,
      TransactionErrorCode.CANNOT_APPROVE_OWN,
      TransactionErrorCode.WALLET_NOT_FOUND,
      TransactionErrorCode.CHAMA_NOT_FOUND,
      TransactionErrorCode.SHARES_UNAVAILABLE,
    ];

    return !nonRecoverableErrors.includes(code);
  }

  /**
   * Get retry delay for different error types
   */
  private static getRetryDelay(code: TransactionErrorCode): number {
    switch (code) {
      case TransactionErrorCode.RATE_LIMITED:
        return 60; // 1 minute
      case TransactionErrorCode.SYSTEM_MAINTENANCE:
        return 300; // 5 minutes
      case TransactionErrorCode.NETWORK_ERROR:
        return 5; // 5 seconds
      case TransactionErrorCode.TIMEOUT_ERROR:
        return 3; // 3 seconds
      default:
        return 10; // 10 seconds
    }
  }

  /**
   * Get user-friendly error message with context
   */
  static getUserMessage(
    error: TransactionError,
    includeContext: boolean = true,
  ): string {
    let message = error.message;

    if (includeContext && error.context && error.type) {
      const contextName =
        error.context.charAt(0).toUpperCase() + error.context.slice(1);
      const typeName = error.type.charAt(0).toUpperCase() + error.type.slice(1);
      message = `${contextName} ${typeName}: ${message}`;
    }

    if (error.retryAfter && error.recoverable) {
      message += ` Please try again in ${error.retryAfter} seconds.`;
    }

    return message;
  }

  /**
   * Get suggested recovery actions
   */
  static getRecoveryActions(error: TransactionError): string[] {
    const actions: string[] = [];

    switch (error.code) {
      case TransactionErrorCode.NETWORK_ERROR:
        actions.push("Check your internet connection");
        actions.push("Try again in a few moments");
        break;

      case TransactionErrorCode.INSUFFICIENT_BALANCE:
        actions.push("Check your account balance");
        if (error.context === "chama") {
          actions.push("Make a chama deposit first");
        }
        break;

      case TransactionErrorCode.AMOUNT_TOO_LOW:
      case TransactionErrorCode.AMOUNT_TOO_HIGH:
        actions.push("Enter an amount within the allowed limits");
        break;

      case TransactionErrorCode.INVALID_PHONE_NUMBER:
        actions.push("Enter a valid Kenyan phone number");
        actions.push("Use format: 254XXXXXXXXX");
        break;

      case TransactionErrorCode.PAYMENT_FAILED:
        actions.push("Try a different payment method");
        actions.push("Check your M-Pesa balance");
        break;

      case TransactionErrorCode.WALLET_LOCKED:
        actions.push("Wait for the lock period to expire");
        actions.push("Contact support for early withdrawal options");
        break;

      default:
        if (error.recoverable) {
          actions.push("Try again");
        } else {
          actions.push("Contact support if the problem persists");
        }
    }

    return actions;
  }
}

// ============================================================================
// React Hook for Error Handling
// ============================================================================

import { useState, useCallback } from "react";

export interface UseTransactionErrorResult {
  error: TransactionError | null;
  setError: (
    error: unknown,
    context?: TransactionContext,
    type?: TransactionType,
  ) => void;
  clearError: () => void;
  retry: () => void;
  canRetry: boolean;
}

export function useTransactionError(): UseTransactionErrorResult {
  const [error, setErrorState] = useState<TransactionError | null>(null);
  const [retryCallback, setRetryCallback] = useState<(() => void) | null>(null);

  const setError = useCallback(
    (error: unknown, context?: TransactionContext, type?: TransactionType) => {
      const parsedError = TransactionErrorHandler.parseError(
        error,
        context,
        type,
      );
      setErrorState(parsedError);
    },
    [],
  );

  const clearError = useCallback(() => {
    setErrorState(null);
    setRetryCallback(null);
  }, []);

  const retry = useCallback(() => {
    if (retryCallback) {
      retryCallback();
      clearError();
    }
  }, [retryCallback, clearError]);

  const canRetry = (error?.recoverable ?? false) && retryCallback !== null;

  return {
    error,
    setError,
    clearError,
    retry,
    canRetry,
  };
}
