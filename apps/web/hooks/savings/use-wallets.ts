"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  PersonalWallet,
  CreateWalletRequest,
  WalletsResponse,
} from "@/lib/types/savings";

export interface UseWalletsReturn {
  wallets: PersonalWallet[];
  totalBalance: number;
  totalBalanceFiat: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createWallet: (walletData: CreateWalletRequest) => Promise<PersonalWallet>;
  updateWallet: (
    walletId: string,
    updates: Partial<PersonalWallet>,
  ) => Promise<PersonalWallet>;
  deleteWallet: (walletId: string) => Promise<void>;
}

export function useWallets(): UseWalletsReturn {
  const [wallets, setWallets] = useState<PersonalWallet[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalBalanceFiat, setTotalBalanceFiat] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/savings/wallets", {
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
      setTotalBalanceFiat(data.totalBalanceFiat || 0);
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
    async (walletData: CreateWalletRequest): Promise<PersonalWallet> => {
      try {
        setError(null);

        const response = await fetch("/api/savings/wallets", {
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

        const newWallet: PersonalWallet = await response.json();

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
      updates: Partial<PersonalWallet>,
    ): Promise<PersonalWallet> => {
      try {
        setError(null);

        const response = await fetch(`/api/savings/wallets/${walletId}`, {
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

        const updatedWallet: PersonalWallet = await response.json();

        // Update the local state
        setWallets((prev) =>
          prev.map((wallet) =>
            wallet.id === walletId ? updatedWallet : wallet,
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

        const response = await fetch(`/api/savings/wallets/${walletId}`, {
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
        setWallets((prev) => prev.filter((wallet) => wallet.id !== walletId));

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
    totalBalanceFiat,
    loading,
    error,
    refetch: fetchWallets,
    createWallet,
    updateWallet,
    deleteWallet,
  };
}
