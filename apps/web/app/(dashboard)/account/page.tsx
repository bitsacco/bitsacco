"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@bitsacco/ui";
import type { User as CoreUser } from "@bitsacco/core/types";
import {
  UserIcon,
  PencilIcon,
  CopyIcon,
  CheckIcon,
  ShieldCheckIcon,
  BellIcon,
  GearIcon,
  EyeIcon,
  EyeClosedIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import {
  useProfile,
  type DisplayPreferences,
} from "../../../hooks/use-profile";
import { ProfileAvatar } from "../../../components/profile/profile-avatar";
import { LightningAddressCard } from "../../../components/profile/lightning-address-card";

interface SecuritySettings {
  currentPin: string;
  newPin: string;
  confirmPin: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "preferences"
  >("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
    type: "success" | "error";
  } | null>(null);

  // Security form state
  const [securityData, setSecurityData] = useState<SecuritySettings>({
    currentPin: "",
    newPin: "",
    confirmPin: "",
  });

  // Use profile hook
  const {
    profileData,
    setProfileData,
    notifications,
    setNotifications,
    displaySettings,
    setDisplaySettings,
    updateProfile,
    changePinCode,
    savePreferences,
    uploadAvatar,
    loading,
    error,
    success,
    clearMessages,
  } = useProfile();

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleProfileSave = async () => {
    const success = await updateProfile();
    if (success) {
      setIsEditing(false);
    }
  };

  const handlePinChange = async () => {
    clearMessages();

    if (securityData.newPin !== securityData.confirmPin) {
      // This will be handled by creating a temporary error state
      // Since the hook doesn't handle validation errors, we need to handle them locally
      return;
    }

    if (!securityData.currentPin || !securityData.newPin) {
      return;
    }

    const success = await changePinCode(
      securityData.currentPin,
      securityData.newPin,
    );
    if (success) {
      setSecurityData({ currentPin: "", newPin: "", confirmPin: "" });
    }
  };

  const handlePreferencesSave = async () => {
    await savePreferences();
  };

  const handleAvatarChange = async (file: File) => {
    await uploadAvatar(file);
  };

  const user = session?.user as CoreUser;

  const handleToast = (message: {
    title: string;
    description: string;
    type: "success" | "error";
  }) => {
    setToast(message);
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div
            className={`p-4 rounded-lg shadow-lg ${toast.type === "success" ? "bg-green-500" : "bg-red-500"}`}
          >
            <h4 className="font-semibold text-white">{toast.title}</h4>
            <p className="text-sm text-white/90 mt-1">{toast.description}</p>
          </div>
        </div>
      )}

      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-300">
            Manage your account information, security, and preferences
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 flex items-center">
            <WarningIcon size={20} weight="bold" className="mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-300 flex items-center">
            <CheckIcon size={20} weight="bold" className="mr-2" />
            {success}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 rounded-xl bg-slate-700/50 p-1 mb-8 max-w-lg">
          <button
            type="button"
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === "profile"
                ? "bg-teal-500/20 text-teal-300 shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-slate-700/60"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <UserIcon size={18} weight="bold" className="inline mr-2" />
            Profile
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === "security"
                ? "bg-teal-500/20 text-teal-300 shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-slate-700/60"
            }`}
            onClick={() => setActiveTab("security")}
          >
            <ShieldCheckIcon size={18} weight="bold" className="inline mr-2" />
            Security
          </button>
          <button
            type="button"
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
              activeTab === "preferences"
                ? "bg-teal-500/20 text-teal-300 shadow-lg"
                : "text-gray-300 hover:text-white hover:bg-slate-700/60"
            }`}
            onClick={() => setActiveTab("preferences")}
          >
            <GearIcon size={18} weight="bold" className="inline mr-2" />
            Preferences
          </button>
        </div>

        {/* Content */}
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
          {activeTab === "profile" && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-semibold text-white">
                  Profile Information
                </h3>
                <Button
                  variant={isEditing ? "outline" : "tealOutline"}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="!text-sm"
                >
                  <PencilIcon size={16} weight="bold" className="mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>

              <div className="space-y-8">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <ProfileAvatar
                    name={profileData.name}
                    avatarUrl={profileData.avatarUrl}
                    size="lg"
                    editable={false}
                    onAvatarChange={handleAvatarChange}
                    loading={loading}
                  />
                  <div>
                    <input
                      type="text"
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                {/* Account Identifiers */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">
                    Account Identifiers
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            Phone Number
                          </p>
                          <p className="text-sm text-gray-300 font-mono">
                            {user?.phone?.number || "Not linked"}
                          </p>
                        </div>
                      </div>
                      {user?.phone?.verified && (
                        <span className="px-2 py-1 text-xs font-medium text-green-400 bg-green-400/10 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-teal-400 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            User ID
                          </p>
                          <p className="text-sm text-gray-300 font-mono">
                            {user?.id
                              ? `${user.id.slice(0, 8)}...${user.id.slice(-8)}`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(user?.id || "", "userId")}
                        className="!text-gray-300 !border-gray-600"
                      >
                        {copied === "userId" ? (
                          <CheckIcon size={16} />
                        ) : (
                          <CopyIcon size={16} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Lightning Address Section */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">
                    Lightning Address
                  </h4>
                  <LightningAddressCard
                    userId={user?.id}
                    onToast={handleToast}
                  />
                </div>

                {isEditing && (
                  <div className="pt-6 border-t border-slate-700">
                    <div className="flex space-x-3">
                      <Button
                        variant="tealPrimary"
                        onClick={handleProfileSave}
                        loading={loading}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="!text-gray-300 !border-gray-600"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="p-8">
              <h3 className="text-xl font-semibold text-white mb-8">
                Security Settings
              </h3>

              <div className="space-y-8">
                {/* Change PIN */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-4">
                    Change PIN
                  </h4>
                  <div className="max-w-md space-y-4">
                    <div className="relative">
                      <label
                        htmlFor="current-pin"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Current PIN
                      </label>
                      <input
                        type={showCurrentPin ? "text" : "password"}
                        id="current-pin"
                        value={securityData.currentPin}
                        onChange={(e) =>
                          setSecurityData((prev) => ({
                            ...prev,
                            currentPin: e.target.value,
                          }))
                        }
                        maxLength={4}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-12"
                        placeholder="Enter current PIN"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPin(!showCurrentPin)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-white transition-colors"
                      >
                        {showCurrentPin ? (
                          <EyeClosedIcon size={20} />
                        ) : (
                          <EyeIcon size={20} />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <label
                        htmlFor="new-pin"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        New PIN
                      </label>
                      <input
                        type={showNewPin ? "text" : "password"}
                        id="new-pin"
                        value={securityData.newPin}
                        onChange={(e) =>
                          setSecurityData((prev) => ({
                            ...prev,
                            newPin: e.target.value,
                          }))
                        }
                        maxLength={4}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-12"
                        placeholder="Enter new PIN"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPin(!showNewPin)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-white transition-colors"
                      >
                        {showNewPin ? (
                          <EyeClosedIcon size={20} />
                        ) : (
                          <EyeIcon size={20} />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <label
                        htmlFor="confirm-pin"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Confirm New PIN
                      </label>
                      <input
                        type={showConfirmPin ? "text" : "password"}
                        id="confirm-pin"
                        value={securityData.confirmPin}
                        onChange={(e) =>
                          setSecurityData((prev) => ({
                            ...prev,
                            confirmPin: e.target.value,
                          }))
                        }
                        maxLength={4}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-12"
                        placeholder="Confirm new PIN"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        className="absolute right-3 top-9 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPin ? (
                          <EyeClosedIcon size={20} />
                        ) : (
                          <EyeIcon size={20} />
                        )}
                      </button>
                    </div>

                    <Button
                      variant="tealPrimary"
                      onClick={handlePinChange}
                      loading={loading}
                      disabled={
                        !securityData.currentPin ||
                        !securityData.newPin ||
                        !securityData.confirmPin
                      }
                    >
                      Update PIN
                    </Button>
                  </div>
                </div>

                {/* Security Status */}
                <div className="border-t border-slate-700 pt-8">
                  <h4 className="text-lg font-medium text-white mb-4">
                    Security Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckIcon
                          size={20}
                          weight="bold"
                          className="text-green-400 mr-3"
                        />
                        <div>
                          <p className="text-sm font-medium text-white">
                            PIN Protected
                          </p>
                          <p className="text-xs text-green-400">
                            Your account is secured with a PIN
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            2FA Available
                          </p>
                          <p className="text-xs text-gray-400">
                            Enable for enhanced security
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="p-8">
              <h3 className="text-xl font-semibold text-white mb-8">
                Preferences
              </h3>

              <div className="space-y-8">
                {/* Notifications */}
                <div>
                  <div className="flex items-center mb-4">
                    <BellIcon
                      size={20}
                      weight="bold"
                      className="text-teal-400 mr-2"
                    />
                    <h4 className="text-lg font-medium text-white">
                      Notifications
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {[
                      {
                        key: "transactions",
                        label: "Transaction Notifications",
                        desc: "Get notified about deposits, withdrawals, and transfers",
                      },
                      {
                        key: "chamaUpdates",
                        label: "Chama Updates",
                        desc: "Notifications about chama activities and contributions",
                      },
                      {
                        key: "marketPlace",
                        label: "Marketplace Notifications",
                        desc: "Updates about share offers and trading opportunities",
                      },
                      {
                        key: "emailNotifications",
                        label: "Email Notifications",
                        desc: "Receive notifications via email",
                      },
                    ].map(({ key, label, desc }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="flex-1 mr-4">
                          <p className="text-sm font-medium text-white">
                            {label}
                          </p>
                          <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              notifications[key as keyof typeof notifications]
                            }
                            onChange={(e) =>
                              setNotifications((prev) => ({
                                ...prev,
                                [key]: e.target.checked,
                              }))
                            }
                            className="sr-only"
                          />
                          <div
                            className={`w-11 h-6 rounded-full relative transition-colors ${
                              notifications[key as keyof typeof notifications]
                                ? "bg-teal-500"
                                : "bg-slate-600"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 ease-in-out ${
                                notifications[key as keyof typeof notifications]
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            ></div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Display Settings */}
                <div className="border-t border-slate-700 pt-8">
                  <h4 className="text-lg font-medium text-white mb-4">
                    Display Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="currency"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Display Currency
                      </label>
                      <select
                        id="currency"
                        value={displaySettings.currency}
                        onChange={(e) =>
                          setDisplaySettings((prev) => ({
                            ...prev,
                            currency: e.target
                              .value as DisplayPreferences["currency"],
                          }))
                        }
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="sats">Satoshis (sats)</option>
                        <option value="btc">Bitcoin (BTC)</option>
                        <option value="usd">US Dollar (USD)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="theme"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Theme
                      </label>
                      <select
                        id="theme"
                        value={displaySettings.theme}
                        onChange={(e) =>
                          setDisplaySettings((prev) => ({
                            ...prev,
                            theme: e.target
                              .value as DisplayPreferences["theme"],
                          }))
                        }
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="language"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Language
                      </label>
                      <select
                        id="language"
                        value={displaySettings.language}
                        onChange={(e) =>
                          setDisplaySettings((prev) => ({
                            ...prev,
                            language: e.target
                              .value as DisplayPreferences["language"],
                          }))
                        }
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="sw">Kiswahili</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700">
                  <Button
                    variant="tealPrimary"
                    onClick={handlePreferencesSave}
                    loading={loading}
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
