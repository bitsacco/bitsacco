/**
 * Standardized Error Display Component
 * Provides consistent error messaging and recovery options across transaction flows
 */

"use client";

import React from "react";
import { Button } from "@bitsacco/ui";
import {
  Warning as ExclamationTriangleIcon,
  X as XIcon,
} from "@phosphor-icons/react";

// ============================================================================
// Types
// ============================================================================

export type ErrorSeverity = "error" | "warning" | "info";

export interface ErrorAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
}

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  severity?: ErrorSeverity;
  actions?: ErrorAction[];
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function ErrorDisplay({
  title,
  message,
  severity = "error",
  actions = [],
  onDismiss,
  className = "",
  compact = false,
}: ErrorDisplayProps) {
  const severityConfig = {
    error: {
      bgGradient: "from-red-500/10 to-rose-500/10",
      border: "border-red-500/30",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
      titleColor: "text-red-300",
      messageColor: "text-red-200",
      shadow: "shadow-red-500/10",
    },
    warning: {
      bgGradient: "from-yellow-500/10 to-orange-500/10",
      border: "border-yellow-500/30",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
      titleColor: "text-yellow-300",
      messageColor: "text-yellow-200",
      shadow: "shadow-yellow-500/10",
    },
    info: {
      bgGradient: "from-blue-500/10 to-teal-500/10",
      border: "border-blue-500/30",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      titleColor: "text-blue-300",
      messageColor: "text-blue-200",
      shadow: "shadow-blue-500/10",
    },
  };

  const config = severityConfig[severity];

  const defaultTitle = {
    error: "Something went wrong",
    warning: "Attention required",
    info: "Information",
  };

  return (
    <div
      className={`animate-in fade-in-50 slide-in-from-top-2 duration-300 ${className}`}
    >
      <div
        className={`
          p-${compact ? "4" : "5"} 
          bg-gradient-to-br ${config.bgGradient} 
          border ${config.border} 
          rounded-xl 
          shadow-lg ${config.shadow}
          relative
        `}
      >
        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            <XIcon size={16} className="text-gray-400 hover:text-gray-300" />
          </button>
        )}

        {/* Content */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          {!compact && (
            <div
              className={`
                w-10 h-10 rounded-full ${config.iconBg} 
                flex items-center justify-center flex-shrink-0 mt-0.5
              `}
            >
              <ExclamationTriangleIcon size={20} className={config.iconColor} />
            </div>
          )}

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            {(title || !compact) && (
              <div className={`font-semibold ${config.titleColor} mb-2`}>
                {title || defaultTitle[severity]}
              </div>
            )}
            <div
              className={`
                ${compact ? "text-sm" : "text-sm"} 
                ${config.messageColor} 
                leading-relaxed
              `}
            >
              {message}
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.loading}
                    className={`
                      text-xs font-medium
                      ${
                        action.variant === "primary"
                          ? "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                          : "border-current hover:bg-white/10"
                      }
                    `}
                  >
                    {action.loading && (
                      <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent mr-2" />
                    )}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Preset Error Components
// ============================================================================

export function NetworkError({
  onRetry,
  retrying = false,
  onDismiss,
}: {
  onRetry?: () => void;
  retrying?: boolean;
  onDismiss?: () => void;
}) {
  return (
    <ErrorDisplay
      title="Network Error"
      message="Unable to connect to our servers. Please check your internet connection and try again."
      severity="error"
      actions={
        onRetry
          ? [
              {
                label: "Try Again",
                onClick: onRetry,
                variant: "primary",
                loading: retrying,
              },
            ]
          : []
      }
      onDismiss={onDismiss}
    />
  );
}

export function ValidationError({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <ErrorDisplay
      title="Validation Error"
      message={message}
      severity="warning"
      onDismiss={onDismiss}
      compact
    />
  );
}

export function TransactionError({
  message,
  onRetry,
  onCancel,
  retrying = false,
}: {
  message: string;
  onRetry?: () => void;
  onCancel?: () => void;
  retrying?: boolean;
}) {
  const actions: ErrorAction[] = [];

  if (onRetry) {
    actions.push({
      label: "Try Again",
      onClick: onRetry,
      variant: "primary",
      loading: retrying,
    });
  }

  if (onCancel) {
    actions.push({
      label: "Cancel",
      onClick: onCancel,
      variant: "outline",
    });
  }

  return (
    <ErrorDisplay
      title="Transaction Failed"
      message={message}
      severity="error"
      actions={actions}
    />
  );
}

export function InsufficientFundsError({
  required,
  available,
  currency = "KES",
  onAddFunds,
  onDismiss,
}: {
  required: number;
  available: number;
  currency?: string;
  onAddFunds?: () => void;
  onDismiss?: () => void;
}) {
  const shortage = required - available;

  return (
    <ErrorDisplay
      title="Insufficient Funds"
      message={`You need ${shortage.toLocaleString()} ${currency} more to complete this transaction. Your current balance is ${available.toLocaleString()} ${currency}.`}
      severity="warning"
      actions={
        onAddFunds
          ? [
              {
                label: "Add Funds",
                onClick: onAddFunds,
                variant: "primary",
              },
            ]
          : []
      }
      onDismiss={onDismiss}
    />
  );
}
