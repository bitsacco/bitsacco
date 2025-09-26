"use client";

import { SessionProvider } from "next-auth/react";
import { FeatureFlagsProvider } from "@/lib/feature-flags-provider";
import { HideBalancesProvider } from "@/contexts/hide-balances-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FeatureFlagsProvider>
        <HideBalancesProvider>{children}</HideBalancesProvider>
      </FeatureFlagsProvider>
    </SessionProvider>
  );
}
