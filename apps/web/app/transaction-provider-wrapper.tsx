/**
 * Transaction Provider Wrapper
 * Wraps TransactionProvider with authenticated API client from context
 */

"use client";

import React from "react";
import { useApiClient } from "@/lib/api-client-provider";
import { TransactionProvider } from "@/lib/transactions/unified/TransactionProvider";

export function TransactionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { client } = useApiClient();

  // Don't render TransactionProvider until we have an authenticated client
  // This prevents errors during the initial load and auth flow
  if (!client) {
    return <>{children}</>;
  }

  return (
    <TransactionProvider apiClient={client}>{children}</TransactionProvider>
  );
}
