"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Button } from "@bitsacco/ui";
import {
  LightningIcon,
  CopyIcon,
  CheckIcon,
  QrCodeIcon,
  ShareIcon,
  PencilIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import QRCode from "qrcode";
import {
  createLightningAddress,
  getUserLightningAddresses,
  updateLightningAddress,
  validateLightningAddress,
  AddressType,
  LightningAddress,
  DEFAULT_LIGHTNING_ADDRESS_DESCRIPTION,
} from "../../lib/services/lightning-address";

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
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

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
        const fullAddress = `${address}@bitsacco.com`;
        const result = await validateLightningAddress(fullAddress);
        setIsAvailable(!result.valid);
      } catch {
        setIsAvailable(true);
      } finally {
        setIsCheckingAvailability(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [address, addressError, existingAddress]);

  const handleClaimAddress = useCallback(async () => {
    if (!address || addressError) return;

    try {
      setIsLoading(true);
      const fullAddress = `${address}@bitsacco.com`;

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
  }, [address, addressError, onToast]);

  const copyAddress = useCallback(() => {
    if (!existingAddress) return;

    const fullAddress = existingAddress.address.includes("@")
      ? existingAddress.address
      : `${existingAddress.address}@${existingAddress.domain || "bitsacco.com"}`;

    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onToast?.({
      title: "Copied!",
      description: "Lightning address copied to clipboard",
      type: "success",
    });
  }, [existingAddress, onToast]);

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

  const handleShowQR = async () => {
    if (!existingAddress) return;

    const fullAddress = existingAddress.address.includes("@")
      ? existingAddress.address
      : `${existingAddress.address}@${existingAddress.domain || "bitsacco.com"}`;

    if (!qrDataUrl) {
      try {
        const qrUrl = await QRCode.toDataURL(`lightning:${fullAddress}`, {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrDataUrl(qrUrl);
      } catch (error) {
        console.error("Failed to generate QR code:", error);
        return;
      }
    }
    setShowQR(!showQR);
  };

  const handleShare = async () => {
    if (!existingAddress) return;

    const fullAddress = existingAddress.address.includes("@")
      ? existingAddress.address
      : `${existingAddress.address}@${existingAddress.domain || "bitsacco.com"}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Lightning Address",
          text: `Send me Bitcoin via Lightning: ${fullAddress}`,
          url: `lightning:${fullAddress}`,
        });
      } catch (error) {
        console.error("Share failed:", error);
        copyAddress();
      }
    } else {
      copyAddress();
    }
  };

  if (isFetching) {
    return (
      <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-6">
        <div className="flex items-center">
          <div className="p-2 bg-orange-500/20 rounded-lg mr-3">
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
      : `${existingAddress.address}@${existingAddress.domain || "bitsacco.com"}`;

    return (
      <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-500/20 rounded-lg mr-3">
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
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800/60 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <p className="font-mono text-orange-300 text-lg break-all">
                  {displayAddress}
                </p>
                {existingAddress.settings.enabled ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                    <CheckIcon size={12} weight="fill" className="mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">
                    <XCircleIcon size={12} weight="fill" className="mr-1" />
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditClick}
                  disabled={isEditMode}
                  className="!border-orange-500/50 !text-orange-300 hover:!bg-orange-500/20 !px-3"
                >
                  <PencilIcon size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                  className="!border-orange-500/50 !text-orange-300 hover:!bg-orange-500/20 !px-3"
                >
                  {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShowQR}
                  className="!border-orange-500/50 !text-orange-300 hover:!bg-orange-500/20 !px-3"
                >
                  <QrCodeIcon size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="!border-orange-500/50 !text-orange-300 hover:!bg-orange-500/20 !px-3"
                >
                  <ShareIcon size={16} />
                </Button>
              </div>
            </div>

            {/* Edit Description Form */}
            {isEditMode ? (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lightning Address Description
                </label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => validateDescription(e.target.value)}
                  placeholder="Enter a description for your lightning address"
                  maxLength={100}
                  autoFocus
                  className="w-full bg-slate-900/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                <div className="flex space-x-2 mt-3">
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
            ) : (
              <div className="mt-2">
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Description:</span>{" "}
                  {existingAddress.metadata.description ||
                    DEFAULT_LIGHTNING_ADDRESS_DESCRIPTION}
                </p>
              </div>
            )}
          </div>

          {showQR && qrDataUrl && (
            <div className="bg-slate-800/60 rounded-lg p-6 text-center">
              <div className="bg-white rounded-lg p-4 inline-block mb-4">
                <Image
                  src={qrDataUrl}
                  alt="Lightning Address QR Code"
                  width={256}
                  height={256}
                  className="rounded-lg"
                />
              </div>
              <p className="text-sm text-gray-300">
                Scan this QR code to send Bitcoin via Lightning Network
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If no address exists, show the claim form
  return (
    <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-orange-500/20 rounded-lg mr-3">
          <LightningIcon size={24} weight="fill" className="text-orange-400" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-white">
            Claim your Lightning Address
          </h4>
          {/* <p className="text-sm text-gray-400">
            Bitsacco Lightning address lets anyone send you Bitcoin instantly,
            just like an email address!
          </p>
          <p className="text-sm text-gray-400">
            The Bitcoin will be deposited directly to your Personal Savings
            wallet
          </p> */}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-300 mb-3">
            Bitsacco Lightning address lets anyone send you Bitcoin instantly,
            just like an email address!
          </p>
          <p className="text-sm text-gray-300 mb-3">
            The Bitcoin will be deposited directly to your Personal Savings
            wallet
          </p>

          <div className="flex items-center bg-slate-800/60 rounded-lg">
            <input
              type="text"
              value={address}
              onChange={(e) => validateAddress(e.target.value)}
              placeholder="username"
              className="flex-1 bg-transparent border-none px-4 py-3 text-white placeholder-gray-400 focus:outline-none"
            />
            <span className="px-4 py-3 text-gray-400">@bitsacco.com</span>
          </div>

          {addressError && (
            <p className="text-red-400 text-sm mt-2">{addressError}</p>
          )}

          {!addressError && address && isCheckingAvailability && (
            <div className="flex items-center space-x-2 mt-2">
              <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400">Checking availability...</p>
            </div>
          )}

          {!addressError &&
            address &&
            !isCheckingAvailability &&
            isAvailable === true && (
              <p className="text-green-400 text-sm mt-2">
                ✓ {address}@bitsacco.com is available!
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
          <LightningIcon size={20} weight="fill" className="mr-2" />
          Claim Lightning Address
        </Button>
      </div>
    </div>
  );
}
