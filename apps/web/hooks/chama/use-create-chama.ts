"use client";

import { useState, useCallback } from "react";
import type { Chama } from "@bitsacco/core";
import { Routes } from "@/lib/routes";

interface CreateChamaData {
  name: string;
  description?: string;
  invites?: Array<{
    phoneNumber?: string;
    nostrNpub?: string;
    roles?: number[];
  }>;
}

export function useCreateChama() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const createChama = useCallback(
    async (data: CreateChamaData): Promise<Chama> => {
      try {
        setIsCreating(true);
        setError(null);
        setIsSuccess(false);

        const response = await fetch(Routes.API.CHAMA.CREATE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to create chama");
        }

        setIsSuccess(true);
        return result.data;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create chama");
        setError(error);
        throw error;
      } finally {
        setIsCreating(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    setIsCreating(false);
  }, []);

  return {
    createChama,
    createChamaAsync: createChama, // Same function for compatibility
    isCreating,
    error,
    isSuccess,
    reset,
  };
}
