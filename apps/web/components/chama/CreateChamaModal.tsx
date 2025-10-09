"use client";

import React, { useState } from "react";
import { Button, PhoneInput, PhoneRegionCode } from "@bitsacco/ui";
import { useCreateChama } from "@/hooks/chama";
import { Spinner } from "@/components/ui/loading-skeleton";
import {
  XIcon,
  PlusIcon,
  TrashIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";

interface CreateChamaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Invite {
  id: string;
  phoneNumber: string;
  countryCode: string;
}

export function CreateChamaModal({ isOpen, onClose, onSuccess }: CreateChamaModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);
  const [newPhone, setNewPhone] = useState("");
  const [regionCode, setRegionCode] = useState<PhoneRegionCode>(
    PhoneRegionCode.Kenya,
  );

  const { createChama, isCreating } = useCreateChama();

  const handleAddInvite = () => {
    if (newPhone) {
      const fullNumber = newPhone;
      setInvites([
        ...invites,
        {
          id: Date.now().toString(),
          phoneNumber: fullNumber,
          countryCode: newPhone.startsWith("+")
            ? newPhone.split(" ")[0] || "+254"
            : "+254",
        },
      ]);
      setNewPhone("");
    }
  };

  const handleRemoveInvite = (id: string) => {
    setInvites(invites.filter((invite) => invite.id !== id));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Please enter a name for your chama");
      return;
    }

    try {
      await createChama({
        name,
        description,
        invites: invites.map((invite) => ({
          phoneNumber: invite.phoneNumber,
          roles: [0], // Member role
        })),
      });
      onSuccess?.(); // Trigger refetch of chama list
      onClose();
    } catch (error) {
      console.error("Failed to create chama:", error);
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
                  Create New Chama
                </h2>
                <p className="text-sm text-gray-400">
                  Start your investment group
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isCreating}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <XIcon size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chama Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isCreating}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter a memorable name for your chama"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isCreating}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                rows={3}
                placeholder="Describe the purpose or goals of this chama"
              />
            </div>

            {/* Invite Members */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Invite Members (optional)
              </label>
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <PhoneInput
                    phone={newPhone}
                    setPhone={setNewPhone}
                    regionCode={regionCode}
                    setRegionCode={setRegionCode}
                    placeholder="Phone number"
                    disabled={isCreating}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddInvite();
                      }
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="tealOutline"
                    size="sm"
                    onClick={handleAddInvite}
                    disabled={!newPhone || isCreating}
                    className="px-3 h-12"
                  >
                    <PlusIcon size={16} weight="bold" />
                  </Button>
                </div>
              </div>

              {/* Invited members list */}
              {invites.length > 0 && (
                <div className="border border-slate-600 bg-slate-700/30 rounded-xl p-4 max-h-32 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-300">
                      {invites.length} member{invites.length !== 1 ? "s" : ""}{" "}
                      to invite
                    </p>
                    <button
                      onClick={() => setInvites([])}
                      disabled={isCreating}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {invites.map((invite, index) => (
                      <div
                        key={invite.id}
                        className="flex justify-between items-center p-2 bg-slate-600/30 rounded-lg animate-in fade-in-50 slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <span className="text-sm text-gray-300 font-medium">
                          {invite.phoneNumber}
                        </span>
                        <button
                          onClick={() => handleRemoveInvite(invite.id)}
                          disabled={isCreating}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-700">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
              className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 hover:!border-slate-500"
            >
              Cancel
            </Button>
            <Button
              variant="tealPrimary"
              onClick={handleSubmit}
              disabled={isCreating || !name.trim()}
              className="shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] transition-all duration-300 min-w-[120px] flex items-center gap-2"
            >
              {isCreating && <Spinner size="sm" />}
              {isCreating ? "Creating..." : "Create Chama"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
