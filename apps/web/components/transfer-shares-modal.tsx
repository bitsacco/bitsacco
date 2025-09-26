"use client";

import { useState, useEffect } from "react";
import { Button } from "@bitsacco/ui";
import {
  ArrowsLeftRightIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import type { SharesTx } from "@bitsacco/core";
import { SHARE_VALUE_KES } from "@/lib/config";
import { Routes } from "@/lib/routes";

interface Member {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

interface TransferSharesModalProps {
  isOpen: boolean;
  onClose: () => void;
  share: SharesTx;
  onSuccess: () => void;
}

export function TransferSharesModal({
  isOpen,
  onClose,
  share,
  onSuccess,
}: TransferSharesModalProps) {
  const [transferType, setTransferType] = useState<"direct" | "marketplace">(
    "direct",
  );
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [listingDays, setListingDays] = useState(30);
  const [pricePerShare, setPricePerShare] = useState(SHARE_VALUE_KES);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  const maxQuantity = share.quantity;

  useEffect(() => {
    if (transferType === "direct" && searchQuery.length > 2) {
      const timer = setTimeout(() => {
        searchMembers();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, transferType]);

  const searchMembers = async () => {
    setSearchLoading(true);
    try {
      const response = await fetch(
        `/api/membership/members?search=${encodeURIComponent(searchQuery)}`,
      );
      if (!response.ok) throw new Error("Failed to search members");
      const data = (await response.json()) as { members: Member[] };
      setMembers(data.members);
    } catch (err) {
      console.error("Failed to search members:", err);
      setMembers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTransfer = async () => {
    setError("");

    // Validation
    if (quantity <= 0 || quantity > maxQuantity) {
      setError(`Please enter a valid quantity between 1 and ${maxQuantity}`);
      return;
    }

    if (transferType === "direct") {
      if (!selectedMember) {
        setError("Please select a recipient");
        return;
      }
      if (selectedMember.id === share.userId) {
        setError("You cannot transfer shares to yourself");
        return;
      }
    } else {
      if (pricePerShare <= 0) {
        setError("Please enter a valid price per share");
        return;
      }
      if (listingDays <= 0) {
        setError("Please select a valid listing duration");
        return;
      }
    }

    setLoading(true);

    try {
      if (transferType === "direct") {
        const response = await fetch(Routes.API.MEMBERSHIP.SHARES.TRANSFER, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toUserId: selectedMember!.id,
            sharesId: share.id,
            quantity,
          }),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error: string };
          throw new Error(errorData.error || "Transfer failed");
        }
      } else {
        // List on marketplace
        const response = await fetch(Routes.API.MEMBERSHIP.SHARES.LIST, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity,
            pricePerShare,
            availableDays: listingDays,
          }),
        });

        if (!response.ok) {
          const errorData = (await response.json()) as { error: string };
          throw new Error(errorData.error || "Listing failed");
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
            <ArrowsLeftRightIcon
              size={24}
              weight="fill"
              className="text-teal-400"
            />
          </div>
          <h3 className="text-xl font-semibold text-gray-100">
            Transfer Shares
          </h3>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Transfer Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Transfer Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTransferType("direct")}
                className={`p-4 rounded-lg border transition-all ${
                  transferType === "direct"
                    ? "bg-teal-500/20 border-teal-500 text-teal-300"
                    : "bg-slate-900/50 border-slate-600 text-gray-300 hover:bg-slate-900"
                }`}
              >
                <div className="text-sm font-medium">Direct Transfer</div>
                <div className="text-xs text-gray-400 mt-1">
                  Send to a specific member
                </div>
              </button>
              <button
                type="button"
                onClick={() => setTransferType("marketplace")}
                className={`p-4 rounded-lg border transition-all ${
                  transferType === "marketplace"
                    ? "bg-teal-500/20 border-teal-500 text-teal-300"
                    : "bg-slate-900/50 border-slate-600 text-gray-300 hover:bg-slate-900"
                }`}
              >
                <div className="text-sm font-medium">List on Marketplace</div>
                <div className="text-xs text-gray-400 mt-1">
                  Available to all members
                </div>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-3">
              Quantity (Max: {maxQuantity})
            </label>
            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.min(
                    maxQuantity,
                    Math.max(1, parseInt(e.target.value) || 1),
                  ),
                )
              }
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
            />
          </div>

          {/* Direct Transfer Fields */}
          {transferType === "direct" && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-3">
                Recipient
              </label>
              <div className="relative">
                <MagnifyingGlassIcon
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by name, email or phone"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder-gray-400"
                />
              </div>

              {searchLoading && (
                <div className="mt-3 text-sm text-gray-400">Searching...</div>
              )}

              {members.length > 0 && (
                <div className="mt-3 max-h-32 overflow-y-auto border border-slate-600 rounded-lg bg-slate-900/50">
                  {members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedMember(member);
                        setSearchQuery(member.name);
                        setMembers([]);
                      }}
                      className="w-full text-left p-3 hover:bg-slate-800 border-b border-slate-600 last:border-0 transition-all"
                    >
                      <div className="text-sm font-medium text-gray-100">
                        {member.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {member.email} • {member.phoneNumber}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedMember && (
                <div className="mt-3 p-3 bg-teal-500/20 border border-teal-500/30 rounded-lg">
                  <div className="text-sm font-medium text-teal-300">
                    Selected: {selectedMember.name}
                  </div>
                  <div className="text-xs text-teal-400">
                    {selectedMember.email}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Marketplace Fields */}
          {transferType === "marketplace" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Price per Share (KES)
                </label>
                <input
                  type="number"
                  min="1"
                  value={pricePerShare}
                  onChange={(e) =>
                    setPricePerShare(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Listing Duration
                </label>
                <select
                  value={listingDays}
                  onChange={(e) => setListingDays(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                  <option value={60}>60 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="text-sm text-gray-300">
                  <div className="flex justify-between mb-2">
                    <span>Total Value:</span>
                    <span className="font-medium text-teal-300">
                      KES {(quantity * pricePerShare).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span className="font-medium">
                      {new Date(
                        Date.now() + listingDays * 24 * 60 * 60 * 1000,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all"
          >
            Cancel
          </Button>
          <Button
            variant="tealPrimary"
            fullWidth
            onClick={handleTransfer}
            disabled={loading || (transferType === "direct" && !selectedMember)}
            className="shadow-lg shadow-teal-500/20"
          >
            {loading
              ? "Processing..."
              : transferType === "direct"
                ? "Transfer Shares"
                : "List on Marketplace"}
          </Button>
        </div>
      </div>
    </div>
  );
}
