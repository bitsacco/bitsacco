"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { 
  ArrowsClockwise, 
  WhatsappLogo, 
  Sun, 
  Moon 
} from "@phosphor-icons/react";

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [btcRate, setBtcRate] = useState("6.9");

  useEffect(() => {
    // Check system theme preference
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(darkModeQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    darkModeQuery.addEventListener("change", handleChange);
    
    return () => darkModeQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? "bg-[#2D3748] text-white" 
        : "bg-gray-50 text-gray-900"
    }`}>
      {/* Navigation Header */}
      <header className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Image 
              src="/assets/logo.svg" 
              alt="Bitsacco Logo" 
              width={40} 
              height={40}
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-teal-500">BITSACCO</span>
          </Link>
          
          {/* Bitcoin Rate Display */}
          <div className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isDark ? "bg-gray-700" : "bg-gray-200"
          }`}>
            <span className="text-sm">1 KES = {btcRate} sats</span>
            <button 
              className="ml-2 p-1 rounded hover:bg-gray-600 transition-colors"
              onClick={() => {/* Refresh rate */}}
              aria-label="Refresh Bitcoin rate"
            >
              <ArrowsClockwise size={16} weight="bold" />
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Link 
              href="/auth/login"
              className={`px-6 py-2 rounded-lg border-2 transition-all font-medium ${
                isDark 
                  ? "border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white" 
                  : "border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white"
              }`}
            >
              LOGIN
            </Link>
            <Link 
              href="/auth/signup"
              className="px-6 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-all font-medium"
            >
              SIGNUP
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-center mb-8 tracking-wide">
          <span className={isDark ? "text-white" : "text-gray-800"}>PLAN </span>
          <span className="text-teal-500">• SAVE • </span>
          <span className={isDark ? "text-white" : "text-gray-800"}>GROW</span>
        </h1>

        {/* Bitcoin Badge */}
        <div className={`inline-flex items-center px-4 py-2 rounded-full mb-8 ${
          isDark ? "bg-gray-700" : "bg-gray-200"
        }`}>
          <span className="text-sm font-medium uppercase tracking-wider">
            Using Bitcoin
          </span>
        </div>

        {/* Description */}
        <p className={`text-center text-lg md:text-xl max-w-3xl mb-12 leading-relaxed ${
          isDark ? "text-gray-300" : "text-gray-600"
        }`}>
          Plan your finances. Save towards targets. Grow your finances<br />
          together with community, friends and family.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/auth/login"
            className={`px-8 py-3 rounded-lg border-2 transition-all font-medium text-lg ${
              isDark 
                ? "border-teal-500 text-teal-400 hover:bg-teal-500 hover:text-white" 
                : "border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white"
            }`}
          >
            LOGIN
          </Link>
          <Link 
            href="/auth/signup"
            className="px-8 py-3 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-all font-medium text-lg"
          >
            SIGNUP
          </Link>
        </div>
      </main>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/254700000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-all shadow-lg z-50"
        aria-label="Contact on WhatsApp"
      >
        <WhatsappLogo size={32} weight="fill" color="white" />
      </a>

      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`fixed bottom-8 left-8 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
          isDark ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"
        }`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun size={24} weight="fill" className="text-yellow-400" />
        ) : (
          <Moon size={24} weight="fill" className="text-gray-800" />
        )}
      </button>
    </div>
  );
}