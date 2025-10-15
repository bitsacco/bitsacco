"use client";

import { useState, useEffect } from "react";
import { Navbar, Hero, Logo, type NavbarButton } from "@bitsacco/ui";
import {
  ArrowsClockwiseIcon,
  WhatsappLogoIcon,
  SpinnerIcon,
  ListIcon,
  XIcon,
} from "@phosphor-icons/react";
import { formatNumber, btcToFiat } from "@bitsacco/core";
import { useExchangeRate } from "@/lib/hooks/useExchangeRate";
import { apiClient } from "@/lib/auth";
import { Routes } from "@/lib/routes";

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

  const buttons: NavbarButton[] = [
    {
      text: "LOGIN",
      href: Routes.LOGIN,
      variant: "tealOutline",
    },
    {
      text: "SIGNUP",
      href: Routes.SIGNUP,
      variant: "tealPrimary",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-[#2D3748] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar
        links={[]}
        buttons={buttons}
        Logo={() => <Logo href="/" />}
        MenuIcon={ListIcon}
        CloseIcon={XIcon}
        bitcoinRateProps={{
          loading,
          quote,
          showBtcRate,
          onToggleRate: () => setShowBtcRate(!showBtcRate),
          onRefresh: refresh,
          kesToSats,
          formatNumber,
          btcToFiat,
          RefreshIcon: ArrowsClockwiseIcon,
          SpinnerIcon: SpinnerIcon,
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
            href: Routes.LOGIN,
            variant: "tealOutline",
          },
          {
            text: "SIGNUP",
            href: Routes.SIGNUP,
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
        <WhatsappLogoIcon size={32} weight="fill" color="white" />
      </a>
    </div>
  );
}
