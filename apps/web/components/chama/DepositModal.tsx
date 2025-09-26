"use client";

import React, { useState } from "react";
import { Button } from "@bitsacco/ui";
import { Spinner } from "@/components/ui/loading-skeleton";
import {
  XIcon,
  LightningIcon,
  DeviceMobileIcon,
  WalletIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import type { Chama } from "@bitsacco/core";
import { Routes } from "@/lib/routes";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  chama: Chama;
}

export function DepositModal({ isOpen, onClose, chama }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "lightning">(
    "mpesa",
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+254");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (paymentMethod === "mpesa" && !phoneNumber) {
      alert("Please enter your phone number");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(Routes.API.CHAMA.DEPOSITS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chamaId: chama.id,
          amount: parseFloat(amount) * 1000, // Convert to KES cents
          paymentMethod,
          paymentDetails:
            paymentMethod === "mpesa"
              ? {
                  phone: `${countryCode}${phoneNumber}`,
                }
              : undefined,
          sharesSubscriptionTracker: `chama-deposit-${Date.now()}`,
          reference: `Deposit to ${chama.name}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to initiate deposit");
      }

      // Handle success - could show QR code for lightning or success message for M-Pesa
      if (
        paymentMethod === "lightning" &&
        data.data?.ledger?.transactions?.[0]?.lightning
      ) {
        // TODO: Show Lightning invoice QR code
        console.log(
          "Lightning invoice:",
          data.data.ledger.transactions[0].lightning,
        );
      }

      alert("Deposit initiated successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to deposit:", error);
      alert("Failed to initiate deposit. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in-50 zoom-in-95 duration-300">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                <WalletIcon size={20} className="text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-100">
                  Deposit Funds
                </h2>
                <p className="text-sm text-gray-400">
                  Add money to {chama.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <XIcon size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (KES)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-gray-100 text-lg font-medium placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="0.00"
                  min="1"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">
                  KES
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mpesa")}
                  disabled={isProcessing}
                  className={`flex items-center justify-center gap-3 px-4 py-4 border-2 rounded-xl transition-all duration-200 disabled:opacity-50 ${
                    paymentMethod === "mpesa"
                      ? "border-teal-500 bg-teal-500/10 text-teal-300"
                      : "border-slate-600 text-gray-300 hover:border-slate-500 hover:bg-slate-700/30"
                  }`}
                >
                  <DeviceMobileIcon
                    size={24}
                    weight={paymentMethod === "mpesa" ? "fill" : "regular"}
                  />
                  <div className="text-left">
                    <div className="font-semibold">M-Pesa</div>
                    <div className="text-xs opacity-80">Mobile payment</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("lightning")}
                  disabled={isProcessing}
                  className={`flex items-center justify-center gap-3 px-4 py-4 border-2 rounded-xl transition-all duration-200 disabled:opacity-50 ${
                    paymentMethod === "lightning"
                      ? "border-teal-500 bg-teal-500/10 text-teal-300"
                      : "border-slate-600 text-gray-300 hover:border-slate-500 hover:bg-slate-700/30"
                  }`}
                >
                  <LightningIcon
                    size={24}
                    weight={paymentMethod === "lightning" ? "fill" : "regular"}
                  />
                  <div className="text-left">
                    <div className="font-semibold">Lightning</div>
                    <div className="text-xs opacity-80">Bitcoin network</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Phone Number (for M-Pesa) */}
            {paymentMethod === "mpesa" && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    disabled={isProcessing}
                    className="px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="+254">+254 (KE)</option>
                    <option value="+255">+255 (TZ)</option>
                    <option value="+256">+256 (UG)</option>
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="7XXXXXXXX"
                  />
                </div>
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-300 leading-relaxed">
                    <DeviceMobileIcon size={16} className="inline mr-2" />
                    You&apos;ll receive an M-Pesa prompt on this number to
                    complete the deposit.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === "lightning" && (
              <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-300">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <p className="text-sm text-yellow-300 leading-relaxed">
                    <LightningIcon size={16} className="inline mr-2" />
                    You&apos;ll receive a Lightning invoice after clicking
                    deposit. Scan the QR code with your Lightning wallet to
                    complete the payment.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 hover:!border-slate-500"
            >
              Cancel
            </Button>
            <Button
              variant="tealPrimary"
              onClick={handleDeposit}
              disabled={
                isProcessing ||
                !amount ||
                (paymentMethod === "mpesa" && !phoneNumber)
              }
              className="shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] transition-all duration-300 min-w-[120px] flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Spinner size="sm" />
                  Processing...
                </>
              ) : (
                <>
                  <PlusIcon size={16} weight="bold" />
                  Deposit Funds
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
