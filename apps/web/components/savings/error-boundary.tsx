"use client";

import React from "react";
import { Button } from "@bitsacco/ui";
import { WarningIcon, ArrowClockwise } from "@phosphor-icons/react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class SavingsErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Savings component error:", error, errorInfo);

    // In production, you might want to send this to an error reporting service
    // trackError(error, { context: 'savings', ...errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetError}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

function DefaultErrorFallback({
  error,
  resetError,
}: DefaultErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
          <WarningIcon size={32} className="text-red-400" />
        </div>

        <h2 className="text-xl font-semibold text-gray-100 mb-2">
          Something went wrong
        </h2>

        <p className="text-gray-400 mb-6">
          There was an error loading your savings data. This might be a
          temporary issue.
        </p>

        {process.env.NODE_ENV === "development" && error && (
          <details className="mb-6 p-4 bg-slate-800 border border-slate-700 rounded-lg text-left">
            <summary className="text-sm text-gray-400 cursor-pointer mb-2">
              Error Details (Development)
            </summary>
            <pre className="text-xs text-red-400 whitespace-pre-wrap overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700"
          >
            <ArrowClockwise size={16} />
            Reload Page
          </Button>

          <Button
            variant="tealPrimary"
            onClick={resetError}
            className="shadow-lg shadow-teal-500/20"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
