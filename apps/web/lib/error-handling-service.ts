import type { ValidationError } from "@bitsacco/core";

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ErrorCategory {
  VALIDATION = "validation",
  PAYMENT = "payment",
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  BUSINESS_LOGIC = "business_logic",
  SYSTEM = "system",
}

export interface AppError {
  id: string;
  code: string;
  message: string;
  userMessage: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  context?: Record<string, unknown>;
  timestamp: Date;
  retryable: boolean;
  actions?: ErrorAction[];
}

export interface ErrorAction {
  label: string;
  action: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export interface UserFeedback {
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  duration?: number;
  actions?: ErrorAction[];
  dismissible?: boolean;
}

/**
 * Enhanced error handling service with user-friendly feedback
 */
export class ErrorHandlingService {
  private static errorMap: Record<string, Partial<AppError>> = {
    // Payment errors
    PAYMENT_FAILED: {
      userMessage:
        "Payment could not be processed. Please check your payment details and try again.",
      category: ErrorCategory.PAYMENT,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
    },
    INSUFFICIENT_FUNDS: {
      userMessage:
        "Insufficient funds in your account. Please check your balance and try again.",
      category: ErrorCategory.PAYMENT,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
    },
    PAYMENT_METHOD_UNAVAILABLE: {
      userMessage:
        "This payment method is not available. Please try a different payment method.",
      category: ErrorCategory.PAYMENT,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
    },
    PAYMENT_TIMEOUT: {
      userMessage: "Payment request timed out. Please try again.",
      category: ErrorCategory.PAYMENT,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
    },

    // Validation errors
    INVALID_QUANTITY: {
      userMessage: "Please enter a valid number of shares.",
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      retryable: false,
    },
    INSUFFICIENT_SHARES: {
      userMessage: "Not enough shares available for this quantity.",
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
    },
    OFFER_EXPIRED: {
      userMessage: "This offer has expired. Please check for current offers.",
      category: ErrorCategory.BUSINESS_LOGIC,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
    },
    KYC_REQUIRED: {
      userMessage: "Identity verification is required for this transaction.",
      category: ErrorCategory.BUSINESS_LOGIC,
      severity: ErrorSeverity.HIGH,
      retryable: false,
    },

    // Network errors
    NETWORK_ERROR: {
      userMessage:
        "Connection error. Please check your internet connection and try again.",
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
    },
    SERVER_ERROR: {
      userMessage: "Server error. Please try again in a few moments.",
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.HIGH,
      retryable: true,
    },

    // Authentication errors
    UNAUTHORIZED: {
      userMessage: "Please log in to continue.",
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      retryable: false,
    },
    SESSION_EXPIRED: {
      userMessage: "Your session has expired. Please log in again.",
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      retryable: false,
    },
  };

  /**
   * Create an AppError from various error types
   */
  static createError(
    error: Error | string | ValidationError,
    context?: Record<string, unknown>,
  ): AppError {
    const id = this.generateErrorId();
    const timestamp = new Date();

    if (typeof error === "string") {
      const errorTemplate = this.errorMap[error] || {};
      return {
        id,
        code: error,
        message: error,
        userMessage:
          errorTemplate.userMessage || "An unexpected error occurred",
        category: errorTemplate.category || ErrorCategory.SYSTEM,
        severity: errorTemplate.severity || ErrorSeverity.MEDIUM,
        context,
        timestamp,
        retryable: errorTemplate.retryable ?? true,
        actions: this.generateActions(error, errorTemplate.retryable ?? true),
      };
    }

    if (error instanceof Error) {
      return {
        id,
        code: error.name || "UNKNOWN_ERROR",
        message: error.message,
        userMessage: this.getUserFriendlyMessage(error.message),
        category: this.categorizeError(error),
        severity: this.determineSeverity(error),
        context,
        timestamp,
        retryable: this.isRetryable(error),
        actions: this.generateActions(
          error.name || "UNKNOWN_ERROR",
          this.isRetryable(error),
        ),
      };
    }

    // Handle ValidationError
    const validationError = error as ValidationError;
    return {
      id,
      code: validationError.code,
      message: validationError.message,
      userMessage: validationError.message,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      context: { field: validationError.field, ...context },
      timestamp,
      retryable: false,
      actions: [],
    };
  }

  /**
   * Convert error to user feedback
   */
  static createUserFeedback(error: AppError): UserFeedback {
    const type = this.getFeedbackType(error.severity);

    return {
      type,
      title: this.getErrorTitle(error.category),
      message: error.userMessage,
      duration: this.getFeedbackDuration(error.severity),
      actions: error.actions,
      dismissible: error.severity !== ErrorSeverity.CRITICAL,
    };
  }

  /**
   * Handle API response errors
   */
  static handleApiError(
    response: Response,
    context?: Record<string, unknown>,
  ): AppError {
    const status = response.status;
    let errorCode = "SERVER_ERROR";

    switch (status) {
      case 400:
        errorCode = "INVALID_REQUEST";
        break;
      case 401:
        errorCode = "UNAUTHORIZED";
        break;
      case 403:
        errorCode = "FORBIDDEN";
        break;
      case 404:
        errorCode = "NOT_FOUND";
        break;
      case 429:
        errorCode = "RATE_LIMITED";
        break;
      case 500:
        errorCode = "SERVER_ERROR";
        break;
      case 503:
        errorCode = "SERVICE_UNAVAILABLE";
        break;
    }

    return this.createError(errorCode, {
      ...context,
      httpStatus: status,
      url: response.url,
    });
  }

  /**
   * Handle network/fetch errors
   */
  static handleNetworkError(
    error: Error,
    context?: Record<string, unknown>,
  ): AppError {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return this.createError("NETWORK_ERROR", context);
    }

    if (error.name === "AbortError") {
      return this.createError("REQUEST_CANCELLED", context);
    }

    return this.createError(error, context);
  }

  /**
   * Create success feedback
   */
  static createSuccessFeedback(
    title: string,
    message: string,
    actions?: ErrorAction[],
  ): UserFeedback {
    return {
      type: "success",
      title,
      message,
      duration: 5000,
      actions,
      dismissible: true,
    };
  }

  /**
   * Create warning feedback
   */
  static createWarningFeedback(
    title: string,
    message: string,
    actions?: ErrorAction[],
  ): UserFeedback {
    return {
      type: "warning",
      title,
      message,
      duration: 8000,
      actions,
      dismissible: true,
    };
  }

  /**
   * Validate and format error for logging
   */
  static formatErrorForLogging(error: AppError): Record<string, unknown> {
    return {
      errorId: error.id,
      code: error.code,
      message: error.message,
      category: error.category,
      severity: error.severity,
      timestamp: error.timestamp.toISOString(),
      context: error.context,
      retryable: error.retryable,
    };
  }

  /**
   * Get recovery suggestions based on error type
   */
  static getRecoverySuggestions(error: AppError): string[] {
    const suggestions: string[] = [];

    switch (error.category) {
      case ErrorCategory.PAYMENT:
        suggestions.push("Check your payment details");
        suggestions.push("Ensure sufficient funds are available");
        suggestions.push("Try a different payment method");
        break;
      case ErrorCategory.NETWORK:
        suggestions.push("Check your internet connection");
        suggestions.push("Try refreshing the page");
        suggestions.push("Wait a moment and try again");
        break;
      case ErrorCategory.VALIDATION:
        suggestions.push("Review the highlighted fields");
        suggestions.push("Ensure all required information is provided");
        break;
      case ErrorCategory.AUTHENTICATION:
        suggestions.push("Log out and log back in");
        suggestions.push("Clear your browser cache");
        suggestions.push("Contact support if the issue persists");
        break;
    }

    return suggestions;
  }

  // Private helper methods
  private static generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getUserFriendlyMessage(message: string): string {
    // Convert technical messages to user-friendly ones
    const technicalPatterns = [
      {
        pattern: /fetch.*failed/i,
        replacement: "Connection error. Please try again.",
      },
      {
        pattern: /network.*error/i,
        replacement: "Network connection issue. Please check your internet.",
      },
      {
        pattern: /timeout/i,
        replacement: "Request timed out. Please try again.",
      },
      { pattern: /unauthorized/i, replacement: "Please log in to continue." },
      {
        pattern: /forbidden/i,
        replacement: "You don't have permission for this action.",
      },
    ];

    for (const { pattern, replacement } of technicalPatterns) {
      if (pattern.test(message)) {
        return replacement;
      }
    }

    return message;
  }

  private static categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();

    if (message.includes("fetch") || message.includes("network")) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes("unauthorized") || message.includes("forbidden")) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (message.includes("validation") || message.includes("invalid")) {
      return ErrorCategory.VALIDATION;
    }
    if (message.includes("payment")) {
      return ErrorCategory.PAYMENT;
    }

    return ErrorCategory.SYSTEM;
  }

  private static determineSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();

    if (message.includes("critical") || message.includes("fatal")) {
      return ErrorSeverity.CRITICAL;
    }
    if (
      message.includes("unauthorized") ||
      message.includes("payment failed")
    ) {
      return ErrorSeverity.HIGH;
    }
    if (message.includes("validation") || message.includes("warning")) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }

  private static isRetryable(error: Error): boolean {
    const nonRetryablePatterns = [
      /unauthorized/i,
      /forbidden/i,
      /not found/i,
      /validation/i,
      /invalid/i,
    ];

    return !nonRetryablePatterns.some((pattern) => pattern.test(error.message));
  }

  private static generateActions(
    errorCode: string,
    retryable: boolean,
  ): ErrorAction[] {
    const actions: ErrorAction[] = [];

    if (retryable) {
      actions.push({
        label: "Try Again",
        action: () => window.location.reload(),
        variant: "primary",
      });
    }

    if (errorCode === "UNAUTHORIZED" || errorCode === "SESSION_EXPIRED") {
      actions.push({
        label: "Log In",
        action: () => (window.location.href = "/login"),
        variant: "primary",
      });
    }

    if (errorCode === "KYC_REQUIRED") {
      actions.push({
        label: "Complete Verification",
        action: () => (window.location.href = "/kyc"),
        variant: "primary",
      });
    }

    return actions;
  }

  private static getFeedbackType(
    severity: ErrorSeverity,
  ): "success" | "warning" | "error" | "info" {
    switch (severity) {
      case ErrorSeverity.LOW:
        return "info";
      case ErrorSeverity.MEDIUM:
        return "warning";
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return "error";
      default:
        return "error";
    }
  }

  private static getErrorTitle(category: ErrorCategory): string {
    switch (category) {
      case ErrorCategory.PAYMENT:
        return "Payment Issue";
      case ErrorCategory.VALIDATION:
        return "Validation Error";
      case ErrorCategory.NETWORK:
        return "Connection Issue";
      case ErrorCategory.AUTHENTICATION:
        return "Authentication Required";
      case ErrorCategory.BUSINESS_LOGIC:
        return "Business Rule Violation";
      case ErrorCategory.SYSTEM:
        return "System Error";
      default:
        return "Error";
    }
  }

  private static getFeedbackDuration(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 3000;
      case ErrorSeverity.MEDIUM:
        return 5000;
      case ErrorSeverity.HIGH:
        return 8000;
      case ErrorSeverity.CRITICAL:
        return 0; // Don't auto-dismiss critical errors
      default:
        return 5000;
    }
  }
}
