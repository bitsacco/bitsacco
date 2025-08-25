"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@bitsacco/ui";

export default function AccountPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "preferences"
  >("profile");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600">
          Manage your account, security, and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-8 max-w-md">
        <button
          type="button"
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === "profile"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          type="button"
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === "security"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("security")}
        >
          Security
        </button>
        <button
          type="button"
          className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === "preferences"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("preferences")}
        >
          Preferences
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === "profile" && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Profile Information
            </h3>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Profile Picture
                  </h4>
                  <p className="text-sm text-gray-600">
                    JPG, GIF or PNG. 1MB max.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Upload Photo
                  </Button>
                </div>
              </div>

              {/* Form */}
              <form className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Display Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue={session?.user?.name || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your.email@example.com"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: Used for notifications and recovery
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="lightning-address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Lightning Address
                  </label>
                  <input
                    type="text"
                    id="lightning-address"
                    name="lightning-address"
                    placeholder="username@bitsacco.com"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your personal Lightning address for receiving payments
                  </p>
                </div>

                <div className="pt-4">
                  <Button variant="primary">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Security Settings
            </h3>

            <div className="space-y-8">
              {/* Change PIN */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Change PIN
                </h4>
                <form className="space-y-4">
                  <div>
                    <label
                      htmlFor="current-pin"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Current PIN
                    </label>
                    <input
                      type="password"
                      id="current-pin"
                      name="current-pin"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-pin"
                      className="block text-sm font-medium text-gray-700"
                    >
                      New PIN
                    </label>
                    <input
                      type="password"
                      id="new-pin"
                      name="new-pin"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-pin"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Confirm New PIN
                    </label>
                    <input
                      type="password"
                      id="confirm-pin"
                      name="confirm-pin"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <Button variant="primary">Update PIN</Button>
                </form>
              </div>

              {/* Account Identifiers */}
              <div className="border-t pt-8">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Account Identifiers
                </h4>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Phone Number
                        </p>
                        <p className="text-sm text-gray-600">+1234567890</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                        Verified
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Nostr Public Key
                        </p>
                        <p className="text-sm text-gray-600 font-mono">
                          Not linked
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Link Nostr
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Preferences
            </h3>

            <div className="space-y-8">
              {/* Notifications */}
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Notifications
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Transaction Notifications
                      </p>
                      <p className="text-sm text-gray-600">
                        Get notified about deposits, withdrawals, and transfers
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Chama Updates
                      </p>
                      <p className="text-sm text-gray-600">
                        Notifications about chama activities and contributions
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      defaultChecked
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Share Marketplace
                      </p>
                      <p className="text-sm text-gray-600">
                        Updates about share offers and trading opportunities
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div className="border-t pt-8">
                <h4 className="text-base font-medium text-gray-900 mb-4">
                  Display Settings
                </h4>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="currency"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Display Currency
                    </label>
                    <select
                      id="currency"
                      name="currency"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="sats">Satoshis (sats)</option>
                      <option value="btc">Bitcoin (BTC)</option>
                      <option value="usd">US Dollar (USD)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="theme"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Theme
                    </label>
                    <select
                      id="theme"
                      name="theme"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button variant="primary">Save Preferences</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
