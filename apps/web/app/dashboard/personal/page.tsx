"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";

interface SavingsWallet {
  id: string;
  name: string;
  type: "personal" | "goal" | "challenge" | "vacation" | "emergency";
  balance: number;
  currency: string;
  icon: string;
  color: string;
  targetAmount?: number;
}

export default function PersonalSavingsPage() {
  const [selectedWallet, setSelectedWallet] = useState("total");

  // Exchange rates and conversions (mock data)
  const btcToKes = 5850000; // 1 BTC = 5,850,000 KES (approximate)
  const btcToSats = 100000000; // 1 BTC = 100,000,000 satoshis

  // Helper function to convert BTC to sats
  const toSats = (btc: number) => Math.round(btc * btcToSats);

  // Mock data for multiple savings wallets
  const savingsWallets: SavingsWallet[] = [
    {
      id: "locked",
      name: "Locked Savings",
      type: "challenge",
      balance: 0.00125,
      currency: "BTC",
      icon: "🔒",
      color: "from-gray-500 to-gray-700",
      targetAmount: 0.05,
    },
    {
      id: "emergency",
      name: "Emergency Fund",
      type: "emergency",
      balance: 0.0025,
      currency: "BTC",
      icon: "🛡️",
      color: "from-green-500 to-emerald-600",
      targetAmount: 0.01,
    },
    {
      id: "vacation",
      name: "Mauritius ABC25",
      type: "goal",
      balance: 0.004,
      currency: "BTC",
      icon: "✈️",
      color: "from-blue-500 to-cyan-600",
      targetAmount: 0.005,
    },
  ];

  // Calculate total balance
  const totalBalance = savingsWallets.reduce(
    (sum, wallet) => sum + wallet.balance,
    0,
  );

  const currentWallet =
    savingsWallets.find((w) => w.id === selectedWallet) || savingsWallets[0];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header - Original Bitsacco style */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Personal Savings</h1>
        <p className="text-gray-600">
          Manage your individual savings and transactions
        </p>
      </div>

      {/* Action Buttons - Mobile/Desktop */}
      <div className="flex gap-2 lg:gap-3 mb-6">
        <button className="flex items-center justify-center flex-1 lg:flex-none px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          <svg
            className="w-4 h-4 mr-1.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Deposit</span>
        </button>
        <button className="flex items-center justify-center flex-1 lg:flex-none px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <svg
            className="w-4 h-4 mr-1.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
          <span>Withdraw</span>
        </button>
        {/* <button className="flex items-center justify-center flex-1 lg:flex-none px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <svg
            className="w-4 h-4 mr-1.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          <span>Send</span>
        </button> */}
      </div>

      {/* Wallets Horizontal Scroll Gallery */}
      <div className="mb-6 lg:mb-8 -mx-4 lg:-mx-6">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 lg:px-6 pb-2">
          {/* Navigation Arrow Left - Desktop Only */}
          <button
            className="hidden lg:flex items-center justify-center flex-shrink-0 w-10 h-[140px] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            onClick={() => {
              const container = document.getElementById(
                "wallet-scroll-container",
              );
              if (container)
                container.scrollBy({ left: -200, behavior: "smooth" });
            }}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div
            id="wallet-scroll-container"
            className="flex gap-3 overflow-x-auto scrollbar-hide"
          >
            {/* Total Balance Card - More Prominent */}
            <button
              onClick={() => setSelectedWallet("total")}
              className={`flex-shrink-0 rounded-xl border-2 p-4 text-left transition-all w-[180px] lg:w-[220px] ${
                selectedWallet === "total"
                  ? "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-500 shadow-lg"
                  : "bg-gradient-to-br from-gray-50 to-white border-gray-300 hover:border-orange-400"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">₿</span>
                  <span className="text-sm font-semibold text-gray-600">
                    BTC
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Total Balance
              </p>
              <p className="text-xl font-bold text-gray-900 mb-1">
                ₿ {toSats(totalBalance).toLocaleString()} sats
              </p>
              <p className="text-base font-medium text-gray-700">
                KES {(totalBalance * btcToKes).toLocaleString("en-KE")}
              </p>
            </button>

            {/* Individual Wallet Cards */}
            {savingsWallets.map((wallet) => (
              <div
                key={wallet.id}
                onClick={() => setSelectedWallet(wallet.id)}
                className={`flex-shrink-0 bg-white rounded-lg border p-4 cursor-pointer transition-all w-[160px] lg:w-[190px] ${
                  selectedWallet === wallet.id
                    ? "border-orange-400 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Header with Icon */}
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  {wallet.type === "challenge" && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">
                      Locked
                    </span>
                  )}
                </div>

                {/* Wallet Name */}
                <p className="text-sm font-medium text-gray-700 mb-3">
                  {wallet.name}
                </p>

                {/* Balance Display */}
                <div className="space-y-1">
                  <p className="text-base font-bold text-gray-900">
                    ₿ {toSats(wallet.balance).toLocaleString()} sats
                  </p>
                  <p className="text-sm text-gray-600">
                    KES{" "}
                    {(wallet.balance * btcToKes).toLocaleString("en-KE", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>

                {/* Target Progress - Simplified */}
                {wallet.targetAmount && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-medium text-gray-700">
                        {Math.round(
                          (wallet.balance / wallet.targetAmount) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min((wallet.balance / wallet.targetAmount) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      of KES{" "}
                      {(wallet.targetAmount * btcToKes).toLocaleString(
                        "en-KE",
                        { maximumFractionDigits: 0 },
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Add New Wallet Button */}
            <button className="flex-shrink-0 bg-white border border-dashed border-gray-300 rounded-lg p-4 w-[160px] lg:w-[190px] flex flex-col items-center justify-center hover:border-orange-400 hover:bg-orange-50 transition-all min-h-[140px]">
              <svg
                className="w-8 h-8 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v12m6-6H6"
                />
              </svg>
              <span className="text-sm text-gray-600">Add Wallet</span>
            </button>
          </div>

          {/* Navigation Arrow Right - Desktop Only */}
          <button
            className="hidden lg:flex items-center justify-center flex-shrink-0 w-10 h-[140px] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            onClick={() => {
              const container = document.getElementById(
                "wallet-scroll-container",
              );
              if (container)
                container.scrollBy({ left: 200, behavior: "smooth" });
            }}
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Custom scrollbar hiding styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Send Again Section */}
      {/* <div className="mb-6 lg:mb-8">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">
          Send again
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                SC
              </div>
              <div>
                <p className="font-medium text-gray-900">Savings Challenge</p>
                <p className="text-sm text-gray-500">Weekly savings goal</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm">
                Repeat
              </Button>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <p className="font-medium text-gray-900">John Doe</p>
                <p className="text-sm text-gray-500">Monthly contribution</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm">
                Repeat
              </Button>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div> */}

      {/* Transactions Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900">
            Transactions
          </h3>
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            See all
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {/* Mock Transaction Items */}
          <div className="px-4 lg:px-6 py-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    To your{" "}
                    {selectedWallet === "total"
                      ? "Personal Savings"
                      : currentWallet?.name || "Personal Savings"}
                  </p>
                  <p className="text-sm text-gray-500">Moved • 12 Aug</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">0.00150000 BTC</p>
                <p className="text-sm text-gray-500">$45.00 USD</p>
              </div>
            </div>
          </div>

          <div className="px-4 lg:px-6 py-4 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 13l-5 5m0 0l-5-5m5 5V6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Monthly Savings</p>
                  <p className="text-sm text-gray-500">Sent • 3 Aug</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">0.00500000 BTC</p>
                <p className="text-sm text-gray-500">$150.00 USD</p>
              </div>
            </div>
          </div>

          {/* No transactions state */}
          <div className="px-4 lg:px-6 py-12 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h4 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">
              No transactions yet
            </h4>
            <p className="text-sm lg:text-base text-gray-600 mb-4">
              Start saving to your{" "}
              {selectedWallet === "total"
                ? "wallets"
                : currentWallet?.name || "wallet"}
            </p>
            <Button variant="primary" size="md">
              Make Your First Deposit
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
        <div className="grid grid-cols-5 py-2">
          <button className="flex flex-col items-center gap-1 py-2 text-orange-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span className="text-xs">Cards</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-xs">Recipients</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs">Payments</span>
          </button>
          <button className="flex flex-col items-center gap-1 py-2 text-gray-600">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-xs">Insights</span>
          </button>
        </div>
      </div>
    </div>
  );
}
