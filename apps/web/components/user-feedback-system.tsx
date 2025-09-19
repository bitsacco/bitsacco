"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { Button } from "@bitsacco/ui";
import {
  CheckCircleIcon,
  WarningIcon,
  XCircleIcon,
  InfoIcon,
  XIcon,
} from "@phosphor-icons/react";
import type { UserFeedback, ErrorAction } from "@/lib/error-handling-service";

interface FeedbackContextType {
  showFeedback: (feedback: UserFeedback) => void;
  showSuccess: (
    title: string,
    message: string,
    actions?: ErrorAction[],
  ) => void;
  showError: (title: string, message: string, actions?: ErrorAction[]) => void;
  showWarning: (
    title: string,
    message: string,
    actions?: ErrorAction[],
  ) => void;
  showInfo: (title: string, message: string, actions?: ErrorAction[]) => void;
  clearFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
}

interface FeedbackProviderProps {
  children: ReactNode;
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [feedback, setFeedback] = useState<UserFeedback | null>(null);

  const showFeedback = (newFeedback: UserFeedback) => {
    setFeedback(newFeedback);

    // Auto-dismiss if duration is set
    if (newFeedback.duration && newFeedback.duration > 0) {
      setTimeout(() => {
        setFeedback(null);
      }, newFeedback.duration);
    }
  };

  const showSuccess = (
    title: string,
    message: string,
    actions?: ErrorAction[],
  ) => {
    showFeedback({
      type: "success",
      title,
      message,
      actions,
      duration: 5000,
      dismissible: true,
    });
  };

  const showError = (
    title: string,
    message: string,
    actions?: ErrorAction[],
  ) => {
    showFeedback({
      type: "error",
      title,
      message,
      actions,
      duration: 8000,
      dismissible: true,
    });
  };

  const showWarning = (
    title: string,
    message: string,
    actions?: ErrorAction[],
  ) => {
    showFeedback({
      type: "warning",
      title,
      message,
      actions,
      duration: 6000,
      dismissible: true,
    });
  };

  const showInfo = (
    title: string,
    message: string,
    actions?: ErrorAction[],
  ) => {
    showFeedback({
      type: "info",
      title,
      message,
      actions,
      duration: 4000,
      dismissible: true,
    });
  };

  const clearFeedback = () => {
    setFeedback(null);
  };

  return (
    <FeedbackContext.Provider
      value={{
        showFeedback,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        clearFeedback,
      }}
    >
      {children}
      <FeedbackNotification feedback={feedback} onDismiss={clearFeedback} />
    </FeedbackContext.Provider>
  );
}

interface FeedbackNotificationProps {
  feedback: UserFeedback | null;
  onDismiss: () => void;
}

function FeedbackNotification({
  feedback,
  onDismiss,
}: FeedbackNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (feedback) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [feedback]);

  if (!feedback) return null;

  const getIcon = () => {
    switch (feedback.type) {
      case "success":
        return (
          <CheckCircleIcon size={24} className="text-green-400" weight="fill" />
        );
      case "error":
        return <XCircleIcon size={24} className="text-red-400" weight="fill" />;
      case "warning":
        return (
          <WarningIcon size={24} className="text-yellow-400" weight="fill" />
        );
      case "info":
        return <InfoIcon size={24} className="text-blue-400" weight="fill" />;
    }
  };

  const getColorClasses = () => {
    switch (feedback.type) {
      case "success":
        return "bg-green-500/10 border-green-500/30 text-green-300";
      case "error":
        return "bg-red-500/10 border-red-500/30 text-red-300";
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-300";
      case "info":
        return "bg-blue-500/10 border-blue-500/30 text-blue-300";
    }
  };

  const getProgressBarColor = () => {
    switch (feedback.type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex justify-center pt-4 px-4">
        <div
          className={`
            max-w-md w-full pointer-events-auto transform transition-all duration-300 ease-in-out
            ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}
          `}
        >
          <div
            className={`
            rounded-xl border-2 p-4 shadow-xl backdrop-blur-sm
            ${getColorClasses()}
          `}
          >
            {/* Progress bar for auto-dismiss */}
            {feedback.duration && feedback.duration > 0 && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700/50 rounded-t-xl overflow-hidden">
                <div
                  className={`h-full ${getProgressBarColor()} transition-all ease-linear`}
                  style={{
                    animation: `shrink ${feedback.duration}ms linear forwards`,
                  }}
                />
              </div>
            )}

            <div className="flex items-start gap-3">
              {getIcon()}

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-100 mb-1">
                  {feedback.title}
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {feedback.message}
                </p>

                {/* Actions */}
                {feedback.actions && feedback.actions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {feedback.actions.map((action, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={
                          action.variant === "primary"
                            ? "tealPrimary"
                            : "outline"
                        }
                        onClick={() => {
                          action.action();
                          onDismiss();
                        }}
                        className={
                          action.variant === "danger"
                            ? "!bg-red-500 !text-white hover:!bg-red-600"
                            : action.variant === "secondary"
                              ? "!bg-slate-700 !text-gray-300 hover:!bg-slate-600"
                              : ""
                        }
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dismiss button */}
              {feedback.dismissible && (
                <button
                  onClick={onDismiss}
                  className="text-gray-400 hover:text-gray-300 transition-colors flex-shrink-0"
                >
                  <XIcon size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

// Enhanced hook for handling async operations with feedback
export function useAsyncOperation() {
  const feedback = useFeedback();
  const [loading, setLoading] = useState(false);

  const execute = async <T,>(
    operation: () => Promise<T>,
    options: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: Error) => void;
    } = {},
  ) => {
    setLoading(true);

    try {
      if (options.loadingMessage) {
        feedback.showInfo("Processing", options.loadingMessage);
      }

      const result = await operation();

      if (options.successMessage) {
        feedback.showSuccess("Success", options.successMessage);
      }

      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : options.errorMessage || "An unexpected error occurred";

      feedback.showError("Error", errorMessage);
      options.onError?.(
        error instanceof Error ? error : new Error(errorMessage),
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading };
}

// Hook for form validation feedback
export function useFormValidation() {
  const feedback = useFeedback();

  const showValidationErrors = (errors: string[]) => {
    if (errors.length === 1) {
      feedback.showError("Validation Error", errors[0]);
    } else if (errors.length > 1) {
      feedback.showError(
        "Validation Errors",
        `Please fix the following issues:\n${errors.map((err) => `• ${err}`).join("\n")}`,
      );
    }
  };

  const showFieldError = (field: string, message: string) => {
    feedback.showError(`${field} Error`, message);
  };

  return { showValidationErrors, showFieldError };
}

// Export everything for easy import
export { ErrorHandlingService } from "@/lib/error-handling-service";
export type { UserFeedback, ErrorAction } from "@/lib/error-handling-service";
