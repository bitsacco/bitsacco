"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Navbar, Hero } from "@bitsacco/ui";
import {
  ArrowsClockwise,
  WhatsappLogo,
  Spinner,
  List,
  X,
} from "@phosphor-icons/react";
import { useExchangeRate, formatNumber, btcToFiat } from "@bitsacco/core";
import { apiClient } from "@/lib/auth";

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const whatsappNumber =
    process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "+254708420214";

  const { quote, loading, showBtcRate, setShowBtcRate, refresh, kesToSats } =
    useExchangeRate({ apiClient });

  useEffect(() => {
    // Check system theme preference
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(darkModeQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    darkModeQuery.addEventListener("change", handleChange);

    return () => darkModeQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#2D3748] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar
        links={[]}
        showAuth={true}
        logoHref="/"
        MenuIcon={List}
        CloseIcon={X}
        bitcoinRateProps={{
          loading,
          quote,
          showBtcRate,
          onToggleRate: () => setShowBtcRate(!showBtcRate),
          onRefresh: refresh,
          kesToSats,
          formatNumber,
          btcToFiat,
          RefreshIcon: ArrowsClockwise,
          SpinnerIcon: Spinner,
          isDark,
        }}
      />

      {/* Hero Section */}
      <Hero
        title={{
          first: "PLAN",
          highlight: "SAVE",
          last: "GROW",
        }}
        badge="USING BITCOIN"
        description="Plan your finances. Save towards targets. Grow your finances together with community, friends and family."
        buttons={[
          {
            text: "LOGIN",
            href: "/auth/login",
            variant: "tealOutline",
          },
          {
            text: "SIGNUP",
            href: "/auth/signup",
            variant: "tealPrimary",
          },
        ]}
      />

      {/* WhatsApp Floating Button */}
      <a
        href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-all shadow-lg z-50"
        aria-label="Contact on WhatsApp"
      >
        <WhatsappLogo size={32} weight="fill" color="white" />
      </a>
    </div>
  );
}
