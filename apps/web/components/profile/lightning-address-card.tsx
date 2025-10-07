"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@bitsacco/ui";
import {
  LightningIcon,
  CopyIcon,
  CheckIcon,
  PencilIcon,
} from "@phosphor-icons/react";
import {
  createLightningAddress,
  getUserLightningAddresses,
  updateLightningAddress,
  validateLightningAddress,
  AddressType,
  LightningAddress,
  DEFAULT_LIGHTNING_ADDRESS_DESCRIPTION,
} from "../../lib/services/lightning-address";
import { getLightningAddressDomain } from "../../lib/membership-config";

interface LightningAddressCardProps {
  userId?: string;
  onToast?: (message: {
    title: string;
    description: string;
    type: "success" | "error";
  }) => void;
}

export function LightningAddressCard({
  userId,
  onToast,
}: LightningAddressCardProps) {
  const [address, setAddress] = useState("");
  const [existingAddress, setExistingAddress] =
    useState<LightningAddress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [addressError, setAddressError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editDescriptionError, setEditDescriptionError] = useState("");

  const [copied, setCopied] = useState(false);

  // Get environment-aware Lightning address domain
  const lightningDomain = getLightningAddressDomain();

  // Fetch existing lightning addresses on mount
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        setIsFetching(true);
        const addresses = await getUserLightningAddresses();
        const personalAddress = addresses.find(
          (addr) => addr.type === AddressType.PERSONAL,
        );
        if (personalAddress) {
          setExistingAddress(personalAddress);
          // Extract username from full address if it contains @
          const addressPart = personalAddress.address.includes("@")
            ? personalAddress.address.split("@")[0]
            : personalAddress.address;
          setAddress(addressPart);
        }
      } catch (error) {
        console.error("Failed to fetch lightning addresses:", error);
      } finally {
        setIsFetching(false);
      }
    })();
  }, [userId]);

  const validateAddress = useCallback((value: string) => {
    setAddress(value);
    setAddressError("");
    setIsAvailable(null);

    if (!value) {
      return;
    }

    // Basic validation
    const addressRegex = /^[a-zA-Z0-9._-]+$/;
    if (!addressRegex.test(value)) {
      setAddressError(
        "Only letters, numbers, dots, underscores, and hyphens allowed",
      );
      return;
    }

    if (value.length < 3) {
      setAddressError("Must be at least 3 characters");
      return;
    }

    if (value.length > 20) {
      setAddressError("Must be 20 characters or less");
      return;
    }
  }, []);

  // Debounced availability check
  useEffect(() => {
    if (!address || addressError || existingAddress) {
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingAvailability(true);
      try {
        const fullAddress = `${address}@${lightningDomain}`;
        const result = await validateLightningAddress(fullAddress);
        setIsAvailable(!result.valid);
      } catch {
        setIsAvailable(true);
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [address, addressError, existingAddress, lightningDomain]);

  const handleClaimAddress = useCallback(async () => {
    if (!address || addressError) return;

    try {
      setIsLoading(true);
      const fullAddress = `${address}@${lightningDomain}`;

      const created = await createLightningAddress({
        address: address,
        type: AddressType.PERSONAL,
        metadata: {
          description: DEFAULT_LIGHTNING_ADDRESS_DESCRIPTION,
          minSendable: 1_000, // 1 sat minimum
          maxSendable: 100_000_000, // .001 BTC maximum
          commentAllowed: 255,
        },
        settings: {
          enabled: true,
          allowComments: true,
          notifyOnPayment: true,
        },
      });

      setExistingAddress(created);
      onToast?.({
        title: "Success!",
        description: `Lightning address ${fullAddress} claimed successfully`,
        type: "success",
      });
    } catch (error: unknown) {
      const errorMessage =
        (error as Error)?.message || "Failed to claim lightning address";
      setAddressError(errorMessage);
      onToast?.({
        title: "Error",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [address, addressError, onToast, lightningDomain]);

  const copyAddress = useCallback(() => {
    if (!existingAddress) return;

    const fullAddress = existingAddress.address.includes("@")
      ? existingAddress.address
      : `${existingAddress.address}@${lightningDomain}`;

    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onToast?.({
      title: "Copied!",
      description: "Lightning address copied to clipboard",
      type: "success",
    });
  }, [existingAddress, onToast, lightningDomain]);

  const handleEditClick = useCallback(() => {
    if (existingAddress) {
      setEditDescription(
        existingAddress.metadata.description ||
          DEFAULT_LIGHTNING_ADDRESS_DESCRIPTION,
      );
      setEditDescriptionError("");
      setIsEditMode(true);
    }
  }, [existingAddress]);

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    setEditDescription("");
    setEditDescriptionError("");
  }, []);

  const validateDescription = useCallback((value: string) => {
    setEditDescription(value);
    setEditDescriptionError("");

    if (!value.trim()) {
      setEditDescriptionError("Description cannot be empty");
      return false;
    }

    if (value.length > 100) {
      setEditDescriptionError("Description must be 100 characters or less");
      return false;
    }

    return true;
  }, []);

  const handleSaveDescription = useCallback(async () => {
    if (!existingAddress || !validateDescription(editDescription)) return;

    try {
      setIsLoading(true);
      const updated = await updateLightningAddress(existingAddress._id, {
        metadata: {
          description: editDescription.trim(),
          minSendable: existingAddress.metadata.minSendable,
          maxSendable: existingAddress.metadata.maxSendable,
          commentAllowed: existingAddress.metadata.commentAllowed,
        },
      });

      if (updated) {
        setExistingAddress(updated);
        setIsEditMode(false);
        onToast?.({
          title: "Success!",
          description: "Lightning address description updated",
          type: "success",
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as Error)?.message || "Failed to update description";
      onToast?.({
        title: "Error",
        description: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [existingAddress, editDescription, validateDescription, onToast]);

  if (isFetching) {
    return (
      <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <LightningIcon
              size={24}
              weight="fill"
              className="text-orange-400"
            />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">
              Lightning Address
            </h4>
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // If user already has an address, show it
  if (existingAddress) {
    const displayAddress = existingAddress.address.includes("@")
      ? existingAddress.address
      : `${existingAddress.address}@${lightningDomain}`;

    return (
      <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <LightningIcon
              size={24}
              weight="fill"
              className="text-orange-400"
            />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white">
              Lightning Address
            </h4>
            <p className="text-sm text-gray-400">
              Your personal Lightning address for receiving payments
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-orange-300 text-base break-all">
                {displayAddress}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditClick}
                  disabled={isEditMode}
                  className="!border-orange-500/50 !text-orange-300 hover:!bg-orange-500/20"
                >
                  <PencilIcon size={16} className="mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                  className="!border-orange-500/50 !text-orange-300 hover:!bg-orange-500/20"
                >
                  {copied ? (
                    <>
                      <CheckIcon size={16} className="mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon size={16} className="mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            {existingAddress.settings.enabled && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 mt-2">
                Active
              </span>
            )}

            {/* Edit Description Form */}
            {isEditMode && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => validateDescription(e.target.value)}
                  placeholder="Enter a description"
                  maxLength={100}
                  autoFocus
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {editDescription.length}/100 characters
                  </span>
                  {editDescriptionError && (
                    <span className="text-xs text-red-400">
                      {editDescriptionError}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveDescription}
                    loading={isLoading}
                    disabled={!!editDescriptionError || !editDescription.trim()}
                    className="!bg-orange-500 hover:!bg-orange-600"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="!border-gray-600 !text-gray-300 hover:!bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {!isEditMode && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-sm text-gray-400">
                  {existingAddress.metadata.description ||
                    DEFAULT_LIGHTNING_ADDRESS_DESCRIPTION}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If no address exists, show the claim form
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-500/20 rounded-lg">
          <LightningIcon size={24} weight="fill" className="text-orange-400" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">
            Claim your Lightning Address
          </h4>
          <p className="text-sm text-gray-400">
            Receive Bitcoin instantly, just like an email address
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center bg-slate-900/50 rounded-lg border border-slate-700">
            <input
              type="text"
              value={address}
              onChange={(e) => validateAddress(e.target.value)}
              placeholder="username"
              className="flex-1 bg-transparent border-none px-4 py-3 text-white placeholder-gray-400 focus:outline-none"
            />
            <span className="px-4 py-3 text-gray-400 font-mono">
              @{lightningDomain}
            </span>
          </div>

          {addressError && (
            <p className="text-red-400 text-sm mt-2">{addressError}</p>
          )}

          {!addressError && address && isCheckingAvailability && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400">Checking availability...</p>
            </div>
          )}

          {!addressError &&
            address &&
            !isCheckingAvailability &&
            isAvailable === true && (
              <p className="text-green-400 text-sm mt-2">
                ✓ {address}@{lightningDomain} is available!
              </p>
            )}

          {!addressError &&
            address &&
            !isCheckingAvailability &&
            isAvailable === false && (
              <p className="text-orange-400 text-sm mt-2">
                This address is already taken. Try another one.
              </p>
            )}
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleClaimAddress}
          loading={isLoading}
          disabled={
            !address ||
            !!addressError ||
            isCheckingAvailability ||
            isAvailable === false
          }
          className="w-full !bg-orange-500 hover:!bg-orange-600 !text-white"
        >
          Claim Lightning Address
        </Button>
      </div>
    </div>
  );
}
