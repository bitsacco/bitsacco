"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";

export default function ChamasPage() {
  const [activeTab, setActiveTab] = useState<"my-chamas" | "discover">(
    "my-chamas",
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Chamas</h1>
        <p className="text-gray-600">
          Join or create investment groups to save together
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-orange-600"
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
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">My Chamas</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-purple-600"
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
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Invested
              </p>
              <p className="text-2xl font-bold text-gray-900">₿ 0.00</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Returns</p>
              <p className="text-2xl font-bold text-gray-900">₿ 0.00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-6 max-w-md">
        <button
          type="button"
          className={`w-full py-2.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === "my-chamas"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("my-chamas")}
        >
          My Chamas
        </button>
        <button
          type="button"
          className={`w-full py-2.5 text-sm font-medium rounded-md transition-colors ${
            activeTab === "discover"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900"
          }`}
          onClick={() => setActiveTab("discover")}
        >
          Discover
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === "my-chamas" ? (
          <div className="p-6">
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                No chamas yet
              </h4>
              <p className="text-gray-600 mb-6">
                Join existing investment groups or create your own to start
                saving with others
              </p>
              <div className="flex justify-center space-x-4">
                <Button variant="primary">Create New Chama</Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("discover")}
                >
                  Browse Chamas
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Discover Chamas
              </h4>
              <p className="text-gray-600 mb-6">
                Search for investment groups to join or browse by category
              </p>
              <div className="max-w-md mx-auto">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search chamas..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Button variant="primary">Search</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
