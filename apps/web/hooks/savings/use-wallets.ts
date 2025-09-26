"use client";

import { useState, useEffect, useCallback } from "react";
import type { WalletResponseDto, WalletType } from "@bitsacco/core";
import { Routes } from "@/lib/routes";

// Define simple types inline
interface CreateWalletRequest {
  name: string;
  type: WalletType;
  targetAmount?: number;
  targetDate?: string;
  lockPeriod?: {
    months: number;
  };
}

interface WalletsResponse {
  wallets: WalletResponseDto[];
  totalBalance: number;
}

export interface UseWalletsReturn {
  wallets: WalletResponseDto[];
  totalBalance: number;
  // totalBalanceFiat removed - will be computed client-side using live exchange rate
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createWallet: (walletData: CreateWalletRequest) => Promise<WalletResponseDto>;
  updateWallet: (
    walletId: string,
    updates: Partial<WalletResponseDto>,
  ) => Promise<WalletResponseDto>;
  deleteWallet: (walletId: string) => Promise<void>;
}

export function useWallets(): UseWalletsReturn {
  const [wallets, setWallets] = useState<WalletResponseDto[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  // totalBalanceFiat state removed - will be computed client-side using live exchange rate
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(Routes.API.PERSONAL.WALLETS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch wallets");
      }

      const data: WalletsResponse = await response.json();
      setWallets(data.wallets || []);
      setTotalBalance(data.totalBalance || 0);
      // totalBalanceFiat no longer set from API - computed client-side using live exchange rate
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching wallets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createWallet = useCallback(
    async (walletData: CreateWalletRequest): Promise<WalletResponseDto> => {
      try {
        setError(null);

        const response = await fetch(Routes.API.PERSONAL.WALLETS, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(walletData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create wallet");
        }

        const newWallet: WalletResponseDto = await response.json();

        // Refresh the wallets list
        await fetchWallets();

        return newWallet;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create wallet";
        setError(errorMessage);
        throw err;
      }
    },
    [fetchWallets],
  );

  const updateWallet = useCallback(
    async (
      walletId: string,
      updates: Partial<WalletResponseDto>,
    ): Promise<WalletResponseDto> => {
      try {
        setError(null);

        const response = await fetch(`/api/personal/wallets/${walletId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update wallet");
        }

        const updatedWallet: WalletResponseDto = await response.json();

        // Update the local state
        setWallets((prev) =>
          prev.map((wallet) =>
            wallet.walletId === walletId ? updatedWallet : wallet,
          ),
        );

        return updatedWallet;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update wallet";
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  const deleteWallet = useCallback(
    async (walletId: string): Promise<void> => {
      try {
        setError(null);

        const response = await fetch(`/api/personal/wallets/${walletId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete wallet");
        }

        // Remove from local state
        setWallets((prev) =>
          prev.filter((wallet) => wallet.walletId !== walletId),
        );

        // Refresh to get updated totals
        await fetchWallets();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete wallet";
        setError(errorMessage);
        throw err;
      }
    },
    [fetchWallets],
  );

  // Initial fetch
  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return {
    wallets,
    totalBalance,
    // totalBalanceFiat removed - computed client-side using live exchange rate
    loading,
    error,
    refetch: fetchWallets,
    createWallet,
    updateWallet,
    deleteWallet,
  };
}
