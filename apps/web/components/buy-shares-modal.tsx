"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";
import { ShoppingBagIcon } from "@phosphor-icons/react";
import type { SharesOffer } from "@bitsacco/core";
import { SHARE_VALUE_KES } from "@/lib/config";
import { useFeatureFlag } from "@/lib/feature-flags-provider";
import { FEATURE_FLAGS } from "@/lib/features";

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
  const isPurchaseEnabled = useFeatureFlag(FEATURE_FLAGS.SHARE_PURCHASE_MODAL);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [subscribing, setSubscribing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const handlePurchaseShares = async () => {
    if (!offer) return;

    setSubscribing(true);
    try {
      const response = await fetch("/api/membership/shares/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id,
          quantity: purchaseQuantity,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
        setPurchaseQuantity(1);
      }
    } catch (error) {
      console.error("Failed to purchase shares:", error);
    } finally {
      setSubscribing(false);
    }
  };

  if (!isOpen || !isPurchaseEnabled) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
            <ShoppingBagIcon
              size={24}
              weight="fill"
              className="text-teal-400"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-100">
            Purchase Shares
          </h3>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            Number of Shares
          </label>
          <input
            type="number"
            min="1"
            max={offer?.quantity || 1}
            value={purchaseQuantity}
            onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
          />
        </div>

        <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
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

        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              onClose();
              setPurchaseQuantity(1);
            }}
            className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all"
          >
            Cancel
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
    </div>
  );
}
