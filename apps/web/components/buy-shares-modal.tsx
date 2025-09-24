"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@bitsacco/ui";
import {
  ShoppingBagIcon,
  LightningIcon,
  DeviceMobileIcon,
  WarningIcon,
  CheckCircleIcon,
  XCircleIcon,
  XIcon,
  ClockIcon,
  type IconWeight,
} from "@phosphor-icons/react";
import type {
  SharesOffer,
  PaymentMethod,
  PaymentStatus,
  ValidationError,
  PaymentConfirmation,
  PaymentIntent,
  SharePurchaseValidation,
} from "@bitsacco/core";
import { PaymentConfirmationModal } from "./payment-confirmation-modal";
import { PaymentRetryModal } from "./payment-retry-modal";
import { SHARE_VALUE_KES } from "@/lib/config";
import { useFeatureFlag } from "@/lib/feature-flags-provider";
import { FEATURE_FLAGS } from "@/lib/features";

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    weight?: IconWeight;
  }>;
  description: string;
  enabled: boolean;
  fees?: string;
}

interface BuySharesModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: SharesOffer | null;
  onSuccess: () => void;
}

export function BuySharesModal({
  isOpen,
  onClose,
  offer,
  onSuccess,
}: BuySharesModalProps) {
  const { data: session } = useSession();
  const isPurchaseEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_SHARE_PURCHASE_MODAL,
  );
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>(
    {},
  );
  const [validation, setValidation] = useState<SharePurchaseValidation | null>(
    null,
  );
  const [subscribing, setSubscribing] = useState(false);
  const [validationLoading, setValidationLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [paymentConfirmation, setPaymentConfirmation] =
    useState<PaymentConfirmation | null>(null);
  const [failedPayment, setFailedPayment] = useState<PaymentIntent | null>(
    null,
  );
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [step, setStep] = useState<"quantity" | "payment" | "confirmation">(
    "quantity",
  );

  // Payment method options
  const paymentMethods: PaymentMethodOption[] = [
    {
      id: "mpesa" as PaymentMethod,
      name: "M-Pesa",
      icon: DeviceMobileIcon,
      description: "Pay with your M-Pesa mobile money",
      enabled: true,
      fees: "Free",
    },
    {
      id: "lightning" as PaymentMethod,
      name: "Lightning",
      icon: LightningIcon,
      description: "Instant Bitcoin Lightning payment",
      enabled: true,
      fees: "Low fees",
    },
    // Bank transfer and card options temporarily hidden
    // {
    //   id: "bank_transfer" as PaymentMethod,
    //   name: "Bank Transfer",
    //   icon: BankIcon,
    //   description: "Direct bank transfer",
    //   enabled: false,
    //   fees: "Standard fees"
    // },
    // {
    //   id: "card" as PaymentMethod,
    //   name: "Credit/Debit Card",
    //   icon: CreditCardIcon,
    //   description: "Pay with card",
    //   enabled: false,
    //   fees: "3% fee"
    // }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const validatePurchase = useCallback(async () => {
    if (!offer) {
      console.warn("No offer available for validation");
      return;
    }

    setValidationLoading(true);
    setErrors([]); // Clear previous errors

    try {
      const response = await fetch("/api/membership/shares/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id,
          quantity: purchaseQuantity,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log("Validation response:", responseData); // Debug log
        const validationData = responseData.data || responseData;

        // Ensure validation data has required structure
        const safeValidation = {
          isValid: validationData?.isValid || false,
          errors: validationData?.errors || [],
          warnings: validationData?.warnings || [],
          eligibility: validationData?.eligibility || {
            canPurchase: false,
            maxQuantity: 0,
            kycStatus: "not_required",
          },
        };

        setValidation(safeValidation);
        setErrors(
          safeValidation.errors?.map((e: ValidationError) => e.message) || [],
        );
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Validation API error:", errorData);
        setErrors([errorData.error || "Failed to validate purchase"]);
        // Set a fallback validation for basic cases
        setValidation({
          isValid: false,
          errors: [
            {
              code: "VALIDATION_FAILED",
              message: errorData.error || "Failed to validate purchase",
              field: "general",
            },
          ],
          warnings: [],
          eligibility: {
            canPurchase: false,
            maxQuantity: 0,
            kycStatus: "not_required",
          },
        });
      }
    } catch (error) {
      console.error("Failed to validate purchase:", error);
      setErrors(["Failed to validate purchase. Please try again."]);
      // Set a fallback validation that allows proceeding if quantity is reasonable
      setValidation({
        isValid:
          purchaseQuantity > 0 && purchaseQuantity <= (offer?.quantity || 1),
        errors: [],
        warnings: [
          {
            code: "VALIDATION_OFFLINE",
            message:
              "Validation service unavailable - proceeding with basic checks",
            canProceed: true,
          },
        ],
        eligibility: {
          canPurchase: true,
          maxQuantity: offer?.quantity || 1,
          kycStatus: "not_required",
        },
      });
    } finally {
      setValidationLoading(false);
    }
  }, [offer, purchaseQuantity]);

  // Validate purchase when quantity changes
  useEffect(() => {
    if (offer && purchaseQuantity > 0) {
      validatePurchase();
    } else if (!offer || purchaseQuantity <= 0) {
      // Reset validation when offer is null or invalid quantity
      setValidation(null);
      setErrors([]);
    }
  }, [offer, purchaseQuantity, validatePurchase]);

  // Initialize validation state when modal opens
  useEffect(() => {
    if (isOpen && !validation && offer && purchaseQuantity > 0) {
      // Set a basic initial validation to prevent crashes
      setValidation({
        isValid: false,
        errors: [],
        warnings: [],
        eligibility: {
          canPurchase: true,
          maxQuantity: offer.quantity || 1000,
          kycStatus: "not_required",
        },
      });
    }
  }, [isOpen, validation, offer, purchaseQuantity]);

  const handleQuantityNext = () => {
    // Check if validation is valid OR if we have basic requirements met (as fallback)
    const canProceed =
      validation?.isValid ||
      (!validationLoading &&
        purchaseQuantity > 0 &&
        purchaseQuantity <= (offer?.quantity || 1000));

    if (canProceed) {
      setStep("payment");
    } else if (!validation && !validationLoading) {
      // If no validation happened, allow proceeding with basic checks
      setStep("payment");
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);

    // For M-Pesa, prefill phone number from session if available
    if (method === "mpesa" && session?.user?.phone?.number) {
      setPaymentDetails({
        phone: session.user.phone.number,
      });
    } else {
      setPaymentDetails({});
    }
  };

  const handlePaymentNext = () => {
    if (selectedPaymentMethod) {
      setStep("confirmation");
    }
  };

  const handlePurchaseShares = async () => {
    if (!offer || !selectedPaymentMethod) return;

    setSubscribing(true);
    try {
      // STEP 1: Create share subscription FIRST (matching webapp implementation)
      const subscriptionResponse = await fetch(
        "/api/membership/shares/subscribe",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            offerId: offer.id,
            quantity: purchaseQuantity,
          }),
        },
      );

      const subscriptionData = await subscriptionResponse.json();

      if (!subscriptionResponse.ok) {
        setErrors([
          subscriptionData.error || "Failed to create share subscription",
        ]);
        return;
      }

      // STEP 2: Process payment through chama deposit with subscription tracker
      const paymentTarget = subscriptionData.data?.paymentTarget;
      if (!paymentTarget) {
        setErrors(["Invalid subscription response - no payment target"]);
        return;
      }

      const paymentResponse = await fetch("/api/chama/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chamaId: paymentTarget.chamaId,
          amount: paymentTarget.amount,
          paymentMethod: selectedPaymentMethod,
          paymentDetails,
          sharesSubscriptionTracker: paymentTarget.sharesSubscriptionTracker,
          reference: paymentTarget.reference,
        }),
      });

      const paymentData = await paymentResponse.json();

      console.log("[BuySharesModal] Chama deposit response:", {
        ok: paymentResponse.ok,
        hasData: !!paymentData.data,
        hasLedger: !!paymentData.data?.ledger,
        hasTransactions: !!paymentData.data?.ledger?.transactions,
        transactionCount: paymentData.data?.ledger?.transactions?.length,
        fullData: JSON.stringify(paymentData.data, null, 2).substring(0, 500),
      });

      if (paymentResponse.ok) {
        // Extract transaction info for monitoring
        const chamaTransaction =
          paymentData.data?.ledger?.transactions?.[0] || paymentData.data;

        console.log("[BuySharesModal] Chama transaction:", {
          hasTransaction: !!chamaTransaction,
          hasLightning: !!chamaTransaction?.lightning,
          hasInvoice: !!chamaTransaction?.lightning?.invoice,
          lightningData: chamaTransaction?.lightning,
        });

        // Log FULL transaction details
        console.log(
          "[BuySharesModal] FULL CHAMA TRANSACTION:",
          chamaTransaction,
        );
        console.log(
          "[BuySharesModal] FULL CHAMA TRANSACTION (stringified):",
          JSON.stringify(chamaTransaction, null, 2),
        );

        if (chamaTransaction) {
          // Create payment confirmation for monitoring
          setPaymentConfirmation({
            paymentId:
              chamaTransaction.id || paymentTarget.sharesSubscriptionTracker,
            amount: paymentTarget.amount,
            currency: "KES",
            method: selectedPaymentMethod,
            status: "pending" as PaymentStatus,
            createdAt: new Date().toISOString(),
            transactionHash: chamaTransaction.id,
            receiptUrl: undefined, // No receipt functionality
            shareTransaction: paymentTarget.shareTransaction,
            chamaId: paymentTarget.chamaId,
            sharesSubscriptionTracker: paymentTarget.sharesSubscriptionTracker,
            // Include Lightning invoice if available - check multiple possible locations
            lightningInvoice: (() => {
              // Check if lightning.invoice exists (correct field path)
              if (chamaTransaction.lightning?.invoice) {
                return chamaTransaction.lightning.invoice;
              }
              // Fallback: Check if lightning is a string (the invoice itself)
              if (
                typeof chamaTransaction.lightning === "string" &&
                chamaTransaction.lightning.startsWith("ln")
              ) {
                return chamaTransaction.lightning;
              }
              return undefined;
            })(),
          });
          setShowConfirmationModal(true);
        } else {
          // Fallback success
          onSuccess();
          handleClose();
        }
      } else {
        setErrors([paymentData.error || "Failed to process payment"]);
      }
    } catch (error) {
      console.error("Failed to purchase shares:", error);
      setErrors(["Failed to process purchase. Please try again."]);
    } finally {
      setSubscribing(false);
    }
  };

  const handleRetryPayment = async (
    paymentIntentId: string,
    newPaymentMethod?: PaymentMethod,
  ) => {
    try {
      const response = await fetch("/api/membership/payments/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          newPaymentMethod,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        if (responseData.paymentConfirmation) {
          setPaymentConfirmation(responseData.paymentConfirmation);
          setShowConfirmationModal(true);
          setShowRetryModal(false);

          if (responseData.paymentConfirmation.status === "completed") {
            onSuccess();
          }
        }
      } else {
        throw new Error(responseData.error || "Failed to retry payment");
      }
    } catch (error) {
      console.error("Failed to retry payment:", error);
      throw error;
    }
  };

  const handleClose = () => {
    onClose();
    setStep("quantity");
    setPurchaseQuantity(1);
    setSelectedPaymentMethod(null);
    setPaymentDetails({});
    setValidation(null);
    setErrors([]);
    setPaymentConfirmation(null);
    setFailedPayment(null);
    setShowConfirmationModal(false);
    setShowRetryModal(false);
  };

  const renderValidationFeedback = () => {
    if (validationLoading) {
      return (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <ClockIcon size={16} className="animate-spin" />
          Validating purchase...
        </div>
      );
    }

    if (!validation) return null;

    return (
      <div className="space-y-2">
        {validation.errors?.map((error, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-red-400 text-sm"
          >
            <XCircleIcon size={16} />
            {error.message}
          </div>
        ))}
        {validation.warnings?.map((warning, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-yellow-400 text-sm"
          >
            <WarningIcon size={16} />
            {warning.message}
          </div>
        ))}
        {validation.isValid && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircleIcon size={16} />
            Purchase validated successfully
          </div>
        )}
      </div>
    );
  };

  const renderPaymentMethodDetails = () => {
    if (!selectedPaymentMethod) return null;

    switch (selectedPaymentMethod) {
      case "mpesa":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                placeholder="254712345678"
                value={paymentDetails.phone || ""}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    phone: e.target.value,
                  })
                }
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              />
            </div>
          </div>
        );
      case "lightning":
        return (
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">
              A Lightning invoice will be generated after confirmation.
              You&apos;ll be able to pay using any Lightning wallet.
            </p>
          </div>
        );
      default:
        return (
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">
              {selectedPaymentMethod} payment method is coming soon.
            </p>
          </div>
        );
    }
  };

  if (!isOpen || !isPurchaseEnabled) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
              <ShoppingBagIcon
                size={24}
                weight="fill"
                className="text-teal-400"
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-100">
                Purchase Shares
              </h3>
              <p className="text-sm text-gray-400">
                Step{" "}
                {step === "quantity" ? "1" : step === "payment" ? "2" : "3"} of
                3
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XIcon size={20} />
          </Button>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            {errors.map((error, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-red-400 text-sm"
              >
                <XCircleIcon size={16} />
                {error}
              </div>
            ))}
          </div>
        )}

        {/* Step 1: Quantity Selection */}
        {step === "quantity" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Number of Shares
              </label>
              <input
                type="number"
                min="1"
                max={offer?.quantity || 1}
                value={purchaseQuantity}
                onChange={(e) =>
                  setPurchaseQuantity(parseInt(e.target.value) || 1)
                }
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              />
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Price per share:</span>
                <span className="text-gray-300">
                  {formatCurrency(SHARE_VALUE_KES)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700">
                <span className="text-gray-400">Total Cost:</span>
                <span className="text-xl font-bold text-teal-300">
                  {formatCurrency(purchaseQuantity * SHARE_VALUE_KES)}
                </span>
              </div>
            </div>

            {renderValidationFeedback()}

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={handleClose}
                className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all"
              >
                Cancel
              </Button>
              <Button
                variant="tealPrimary"
                fullWidth
                onClick={handleQuantityNext}
                disabled={validationLoading || purchaseQuantity <= 0}
                className="shadow-lg shadow-teal-500/20"
              >
                Next: Payment Method
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Method Selection */}
        {step === "payment" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-100 mb-4">
                Select Payment Method
              </h4>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedPaymentMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() =>
                        method.enabled && handlePaymentMethodSelect(method.id)
                      }
                      disabled={!method.enabled}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? "border-teal-500 bg-teal-500/10"
                          : method.enabled
                            ? "border-slate-700 bg-slate-900/50 hover:border-slate-600"
                            : "border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={24}
                          className={
                            isSelected ? "text-teal-400" : "text-gray-400"
                          }
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-medium ${isSelected ? "text-teal-300" : "text-gray-300"}`}
                            >
                              {method.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {method.fees}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            {method.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {renderPaymentMethodDetails()}

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setStep("quantity")}
                className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all"
              >
                Back
              </Button>
              <Button
                variant="tealPrimary"
                fullWidth
                onClick={handlePaymentNext}
                disabled={!selectedPaymentMethod}
                className="shadow-lg shadow-teal-500/20"
              >
                Next: Confirm
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === "confirmation" && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-100 mb-4">
                Confirm Purchase
              </h4>

              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Shares:</span>
                    <span className="text-gray-300">{purchaseQuantity}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Payment Method:</span>
                    <span className="text-gray-300">
                      {
                        paymentMethods.find(
                          (m) => m.id === selectedPaymentMethod,
                        )?.name
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                    <span className="text-gray-400">Total:</span>
                    <span className="text-xl font-bold text-teal-300">
                      {formatCurrency(purchaseQuantity * SHARE_VALUE_KES)}
                    </span>
                  </div>
                </div>

                {selectedPaymentMethod === "mpesa" && paymentDetails.phone && (
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">
                      A payment request will be sent to:{" "}
                      <span className="text-gray-300">
                        {paymentDetails.phone}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setStep("payment")}
                disabled={subscribing}
                className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all"
              >
                Back
              </Button>
              <Button
                variant="tealPrimary"
                fullWidth
                onClick={handlePurchaseShares}
                disabled={subscribing}
                className="shadow-lg shadow-teal-500/20"
              >
                {subscribing ? "Processing..." : "Confirm Purchase"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          if (paymentConfirmation?.status === "completed") {
            handleClose();
          }
        }}
        payment={paymentConfirmation}
        enableRealTimeUpdates={true}
        onPaymentComplete={() => {
          // Update the payment confirmation with the latest data
          if (paymentConfirmation) {
            setPaymentConfirmation({
              ...paymentConfirmation,
              status: "completed" as PaymentStatus,
            });
          }
          // Trigger success callback
          onSuccess();
        }}
        onRetry={() => {
          if (paymentConfirmation) {
            setFailedPayment({
              id: paymentConfirmation.paymentId,
              amount: paymentConfirmation.amount,
              currency: paymentConfirmation.currency,
              method: paymentConfirmation.method,
              status: "failed" as PaymentStatus,
              details: paymentDetails,
              createdAt: paymentConfirmation.createdAt,
              updatedAt: paymentConfirmation.createdAt,
              description: `Share purchase - ${purchaseQuantity} shares`,
            });
            setShowConfirmationModal(false);
            setShowRetryModal(true);
          }
        }}
      />

      {/* Payment Retry Modal */}
      <PaymentRetryModal
        isOpen={showRetryModal}
        onClose={() => setShowRetryModal(false)}
        failedPayment={failedPayment}
        onRetry={handleRetryPayment}
      />
    </div>
  );
}
