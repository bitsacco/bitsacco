"use client";

import { SessionProvider } from "next-auth/react";
import { FeatureFlagsProvider } from "@/lib/feature-flags-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FeatureFlagsProvider>{children}</FeatureFlagsProvider>
    </SessionProvider>
  );
}
