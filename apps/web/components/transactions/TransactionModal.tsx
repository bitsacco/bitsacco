/**
 * Universal Transaction Modal Component
 * Works across all contexts (chama, personal, membership) with adaptive workflows
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  ModalTemplate,
  ModalTemplateContent,
  ModalTemplateFooter,
  ModalTemplateHeader,
  ModalTemplateTitle,
  Button,
} from "@bitsacco/ui";
import {
  X as XMarkIcon,
  ArrowLeft as ArrowLeftIcon,
} from "@phosphor-icons/react";

import type {
  UnifiedTransactionType as TransactionType,
  TransactionContext,
  Money,
  PaymentMethodType,
  UnifiedTransaction,
  UnifiedCreateTransactionRequest as CreateTransactionRequest,
  TransactionLimits,
} from "@bitsacco/core";
import { Currency } from "@bitsacco/core";
import { useTransactions } from "@/lib/transactions/unified/TransactionProvider";

import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { ErrorDisplay } from "./ErrorDisplay";
import { AmountStep } from "./steps/AmountStep";
import { ReviewStep } from "./steps/ReviewStep";
import { ApprovalPendingStep } from "./steps/ApprovalPendingStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { ProcessingStep } from "./steps/ProcessingStep";

// ============================================================================
// Types
// ============================================================================

export interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: TransactionContext;
  type: TransactionType;
  targetId: string; // walletId, chamaId, etc.
  targetName?: string;
  onSuccess?: (transaction: UnifiedTransaction) => void;
  initialAmount?: number;
  limits?: TransactionLimits;
}

type TransactionStep =
  | "amount"
  | "payment"
  | "review"
  | "confirmation"
  | "approval_pending"
  | "processing";

interface StepData {
  amount?: Money;
  reference?: string;
  paymentMethod?: PaymentMethodType;
  phoneNumber?: string;
  lightningInvoice?: string;
}

// ============================================================================
// Component
// ============================================================================

export function TransactionModal({
  isOpen,
  onClose,
  context,
  type,
  targetId,
  targetName,
  onSuccess,
  initialAmount,
}: TransactionModalProps) {
  const { createTransaction } = useTransactions();

  const [currentStep, setCurrentStep] = useState<TransactionStep>("amount");
  const [stepData, setStepData] = useState<StepData>({
    amount: initialAmount
      ? { value: initialAmount, currency: Currency.KES }
      : undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTransaction, setCreatedTransaction] =
    useState<UnifiedTransaction | null>(null);

  // Determine workflow steps based on context and type
  const workflowSteps: TransactionStep[] = useMemo(() => {
    const isWithdrawal = type === "withdrawal";
    const isChamaWithdrawal = context === "chama" && isWithdrawal;

    if (isChamaWithdrawal) {
      // Chama withdrawals: amount → review → submit (no reason step)
      return ["amount", "review", "approval_pending"] as const;
    }

    // All other transactions: amount → payment → confirm
    return ["amount", "payment", "confirmation", "processing"] as const;
  }, [context, type]);

  const currentStepIndex = workflowSteps.indexOf(currentStep);
  const isLastStep = currentStepIndex === workflowSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(workflowSteps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(workflowSteps[currentStepIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    if (!stepData.amount) {
      setError("Amount is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: CreateTransactionRequest = {
        type,
        context,
        amount: stepData.amount!,
        targetId,
        paymentMethod: stepData.paymentMethod,
        metadata: {
          reference: stepData.reference,
          phoneNumber: stepData.phoneNumber,
          // lightningInvoice will be set by the backend when creating Lightning invoices
        },
      };

      const transaction = await createTransaction(request);
      setCreatedTransaction(transaction);

      // Transaction created successfully

      // Capture Lightning invoice from transaction response if present
      if (transaction.metadata?.lightningInvoice) {
        // Extract the invoice string from the FmLightning object
        const invoiceString =
          transaction.metadata.lightningInvoice.invoice || "";
        setStepData({
          ...stepData,
          lightningInvoice: invoiceString,
        });
      }

      // Move to next step based on transaction status and type
      // CRITICAL: Only withdrawals should ever show approval pending UI
      if (transaction.status === "pending_approval" && type === "withdrawal") {
        setCurrentStep("approval_pending");
      } else if (
        transaction.status === "pending_approval" &&
        type === "deposit"
      ) {
        // Unexpected state - fallback to processing
        setCurrentStep("processing");
      } else {
        setCurrentStep("processing");
      }

      // Auto-close for completed transactions
      if (transaction.status === "completed") {
        setTimeout(() => {
          onSuccess?.(transaction);
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCurrentStep("amount");
      setStepData({
        amount: initialAmount
          ? { value: initialAmount, currency: Currency.KES }
          : undefined,
      });
      setError(null);
      setCreatedTransaction(null);
      onClose();
    }
  };

  const getContextName = () => {
    switch (context) {
      case "chama":
        return targetName || "Chama";
      default:
        return "Account";
    }
  };

  const getTransactionTitle = () => {
    const contextName = getContextName();
    switch (type) {
      case "deposit":
        return `Deposit to ${contextName}`;
      case "withdrawal":
        return `Withdraw from ${contextName}`;
      case "transfer":
        return `Transfer to ${contextName}`;
      default:
        return `Transaction to ${contextName}`;
    }
  };

  return (
    <ModalTemplate open={isOpen} onOpenChange={handleClose}>
      <ModalTemplateContent>
        <ModalTemplateHeader>
          <div className="flex items-start justify-between mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <ModalTemplateTitle className="text-lg sm:text-xl font-semibold text-gray-100 truncate">
                {getTransactionTitle()}
              </ModalTemplateTitle>
            </div>
            <div className="flex items-center flex-shrink-0">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={loading}
                className="text-gray-300 hover:text-white hover:bg-slate-700/70 bg-slate-800/50 transition-all duration-200 h-9 w-9 p-0 rounded-lg border border-slate-600/50 hover:border-slate-500"
              >
                <XMarkIcon size={20} />
              </Button>
            </div>
          </div>

          {/* Enhanced Progress Steps - Mobile Responsive */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between px-1">
              {workflowSteps.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 shadow-lg ${
                          isCompleted
                            ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-teal-500/25"
                            : isActive
                              ? "bg-gradient-to-br from-teal-500/20 to-teal-600/20 text-teal-400 border-2 border-teal-500 shadow-teal-500/10"
                              : "bg-slate-700/50 text-slate-400 border border-slate-600/50"
                        }`}
                      >
                        {isCompleted ? (
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div
                        className={`mt-1.5 sm:mt-2 text-xs font-medium transition-colors duration-300 text-center max-w-16 sm:max-w-20 ${
                          isActive
                            ? "text-teal-400"
                            : isCompleted
                              ? "text-gray-300"
                              : "text-gray-500"
                        }`}
                      >
                        <span className="hidden sm:inline">
                          {step.charAt(0).toUpperCase() +
                            step.slice(1).replace("_", " ")}
                        </span>
                        <span className="sm:hidden">
                          {step === "amount"
                            ? "Amt"
                            : step === "payment"
                              ? "Pay"
                              : step === "review"
                                ? "Rev"
                                : step === "confirmation"
                                  ? "Conf"
                                  : step === "approval_pending"
                                    ? "Wait"
                                    : step === "processing"
                                      ? "Proc"
                                      : (step as string)
                                          .charAt(0)
                                          .toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <div className="flex-1 mx-2 sm:mx-4 mt-2">
                        <div
                          className={`h-0.5 rounded-full transition-all duration-500 ${
                            isCompleted
                              ? "bg-gradient-to-r from-teal-500 to-teal-600"
                              : "bg-slate-700/50"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ModalTemplateHeader>

        <div className="min-h-[400px] sm:min-h-[440px] py-6 sm:py-8 px-1 sm:px-0">
          {error && (
            <div className="mb-8">
              <ErrorDisplay
                message={error}
                severity="error"
                onDismiss={() => setError(null)}
              />
            </div>
          )}

          <div className="animate-in fade-in-50 slide-in-from-right-4 duration-500">
            {currentStep === "amount" && (
              <AmountStep
                context={context}
                type={type}
                initialAmount={stepData.amount?.value}
                initialReference={stepData.reference}
                onNext={(amount, reference) => {
                  setStepData({ ...stepData, amount, reference });
                  handleNext();
                }}
              />
            )}
          </div>

          <div className="animate-in fade-in-50 slide-in-from-right-4 duration-500">
            {currentStep === "payment" && (
              <PaymentStep
                amount={stepData.amount!}
                type={type}
                context={context}
                paymentMethod={stepData.paymentMethod}
                onPaymentMethodChange={(method) =>
                  setStepData({ ...stepData, paymentMethod: method })
                }
                onNext={handleNext}
              />
            )}
          </div>

          <div className="animate-in fade-in-50 slide-in-from-right-4 duration-500">
            {currentStep === "review" && (
              <ReviewStep
                context={context}
                type={type}
                amount={stepData.amount!}
                targetName={getContextName()}
                onSubmit={handleSubmit}
                loading={loading}
              />
            )}
          </div>

          <div className="animate-in fade-in-50 slide-in-from-right-4 duration-500">
            {currentStep === "approval_pending" && (
              <ApprovalPendingStep
                transaction={createdTransaction}
                transactionType={type}
              />
            )}
          </div>

          <div className="animate-in fade-in-50 slide-in-from-right-4 duration-500">
            {currentStep === "confirmation" && (
              <ConfirmationStep
                amount={stepData.amount!}
                paymentMethod={stepData.paymentMethod!}
                targetName={getContextName()}
                onSubmit={handleSubmit}
                loading={loading}
              />
            )}
          </div>

          <div className="animate-in fade-in-50 slide-in-from-right-4 duration-500">
            {currentStep === "processing" && (
              <ProcessingStep
                transaction={createdTransaction}
                onSuccess={onSuccess}
                onClose={handleClose}
                paymentMethod={stepData.paymentMethod}
                lightningInvoice={stepData.lightningInvoice}
              />
            )}
          </div>
        </div>

        <ModalTemplateFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-4 sm:pt-6 border-t border-slate-700/50">
          <div className="flex gap-3">
            {!isFirstStep &&
              currentStep !== "approval_pending" &&
              currentStep !== "processing" && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  className="border-slate-600/50 text-gray-300 hover:border-slate-500 hover:bg-slate-700/50 transition-all duration-200 flex-1 sm:flex-none"
                >
                  <ArrowLeftIcon size={16} className="mr-2" />
                  Back
                </Button>
              )}
          </div>

          {(currentStep === "approval_pending" ||
            currentStep === "processing") && (
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-slate-600/50 text-gray-300 hover:border-slate-500 hover:bg-slate-700/50 transition-all duration-200 px-6 w-full sm:w-auto"
            >
              Close
            </Button>
          )}
        </ModalTemplateFooter>
      </ModalTemplateContent>
    </ModalTemplate>
  );
}

// ============================================================================
// Step Components
// ============================================================================

function PaymentStep({
  amount,
  type,
  context,
  paymentMethod,
  onPaymentMethodChange,
  onNext,
}: {
  amount: Money;
  type: TransactionType;
  context: TransactionContext;
  paymentMethod?: PaymentMethodType;
  onPaymentMethodChange: (method: PaymentMethodType) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <PaymentMethodSelector
        amount={amount}
        type={type}
        context={context}
        selectedMethod={paymentMethod}
        onSelect={onPaymentMethodChange}
      />
      <Button
        variant="tealPrimary"
        onClick={onNext}
        disabled={!paymentMethod}
        className="w-full shadow-lg shadow-teal-500/20 h-12 text-base font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] group"
      >
        <span className="group-hover:scale-105 transition-transform duration-200">
          Continue
        </span>
      </Button>
    </div>
  );
}
