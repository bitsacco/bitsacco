"use client";

import React, { useState } from "react";
import { Button } from "@bitsacco/ui";
import { Spinner } from "@/components/ui/loading-skeleton";
import {
  XIcon,
  PlusIcon,
  TrashIcon,
  PaperPlaneIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { Routes } from "@/lib/routes";

interface InviteMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  chamaId: string;
  chamaName: string;
}

interface Invite {
  id: string;
  phoneNumber: string;
  countryCode: string;
}

export function InviteMembersModal({
  isOpen,
  onClose,
  chamaId,
  chamaName,
}: InviteMembersModalProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [newPhone, setNewPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+254");
  const [isSending, setIsSending] = useState(false);

  const handleAddInvite = () => {
    if (newPhone) {
      const fullNumber = `${countryCode}${newPhone}`;
      // Check if number already added
      if (invites.some((inv) => inv.phoneNumber === fullNumber)) {
        alert("This number is already in the list");
        return;
      }

      setInvites([
        ...invites,
        {
          id: Date.now().toString(),
          phoneNumber: fullNumber,
          countryCode,
        },
      ]);
      setNewPhone("");
    }
  };

  const handleRemoveInvite = (id: string) => {
    setInvites(invites.filter((invite) => invite.id !== id));
  };

  const handleSendInvites = async () => {
    if (invites.length === 0) {
      alert("Please add at least one phone number");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(Routes.API.CHAMA.INVITE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chamaId,
          invites: invites.map((invite) => ({
            phoneNumber: invite.phoneNumber,
            roles: [0], // Member role by default
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to send invites");
      }

      alert(`Successfully sent ${invites.length} invitation(s)`);
      onClose();
    } catch (error) {
      console.error("Failed to send invites:", error);
      alert("Failed to send invitations. Please try again.");
    } finally {
      setIsSending(false);
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
                <UsersThreeIcon size={20} className="text-teal-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-100">
                  Invite Members
                </h2>
                <p className="text-sm text-gray-400">
                  Add people to {chamaName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSending}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <XIcon size={20} />
            </button>
          </div>

          {/* Info */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-sm text-blue-300 leading-relaxed">
              <PaperPlaneIcon size={16} className="inline mr-2" />
              New members will receive an SMS invitation with instructions to
              join <strong className="text-blue-200">{chamaName}</strong>.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Add phone number */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Add Phone Numbers
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={isSending}
                  className="px-3 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="+254">+254 (KE)</option>
                  <option value="+255">+255 (TZ)</option>
                  <option value="+256">+256 (UG)</option>
                  <option value="+1">+1 (US)</option>
                </select>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  disabled={isSending}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddInvite();
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter phone number"
                />
                <Button
                  variant="tealOutline"
                  size="sm"
                  onClick={handleAddInvite}
                  disabled={!newPhone || isSending}
                  className="px-3"
                >
                  <PlusIcon size={16} weight="bold" />
                </Button>
              </div>
            </div>

            {/* Invites list */}
            {invites.length > 0 && (
              <div className="border border-slate-600 bg-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <UsersThreeIcon size={16} className="text-teal-400" />
                    <p className="text-sm font-medium text-gray-300">
                      {invites.length} member{invites.length !== 1 ? "s" : ""}{" "}
                      to invite
                    </p>
                  </div>
                  <button
                    onClick={() => setInvites([])}
                    disabled={isSending}
                    className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50 px-2 py-1 hover:bg-red-500/20 rounded transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {invites.map((invite, index) => (
                    <div
                      key={invite.id}
                      className="flex justify-between items-center p-3 bg-slate-600/30 rounded-lg hover:bg-slate-600/50 transition-colors animate-in fade-in-50 slide-in-from-bottom-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-500/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-teal-300">
                            {invite.phoneNumber.slice(-1)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-300 font-medium">
                          {invite.phoneNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveInvite(invite.id)}
                        disabled={isSending}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSending}
              className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 hover:!border-slate-500"
            >
              Close
            </Button>
            <Button
              variant="tealPrimary"
              onClick={handleSendInvites}
              disabled={isSending || invites.length === 0}
              className="shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] transition-all duration-300 min-w-[140px] flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <Spinner size="sm" />
                  Sending...
                </>
              ) : (
                <>
                  <PaperPlaneIcon size={16} weight="bold" />
                  Send {invites.length} Invite{invites.length !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
