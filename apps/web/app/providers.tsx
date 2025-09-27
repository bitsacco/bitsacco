"use client";

import { SessionProvider } from "next-auth/react";
import { FeatureFlagsProvider } from "@/lib/feature-flags-provider";
import { HideBalancesProvider } from "@/contexts/hide-balances-context";
import { ApiClientProvider } from "@/lib/api-client-provider";
import { TransactionProviderWrapper } from "./transaction-provider-wrapper";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FeatureFlagsProvider>
        <HideBalancesProvider>
          <ApiClientProvider>
            <TransactionProviderWrapper>{children}</TransactionProviderWrapper>
          </ApiClientProvider>
        </HideBalancesProvider>
      </FeatureFlagsProvider>
    </SessionProvider>
  );
}
