"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  isDark?: boolean;
}

export function Logo({ className = "", isDark = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center group transition-all duration-200 hover:scale-105 ${className}`}
    >
      {/* Small screen logo (just the icon) */}
      <div className="block md:hidden">
        <Image
          src="/assets/logo.svg"
          alt="Bitsacco Logo"
          width={65}
          height={65}
          className="h-[50px] w-auto cursor-pointer select-none"
          style={{
            filter: `${isDark ? "brightness(1.1)" : ""} drop-shadow(0 1px 2px rgba(0,128,128,0.1))`,
          }}
          priority
        />
      </div>

      {/* Large screen logo (full logo with text) */}
      <div className="hidden md:block">
        <Image
          src="/assets/logo_full.svg"
          alt="Bitsacco Full Logo"
          width={160}
          height={65}
          className="h-[50px] md:h-[65px] w-auto cursor-pointer select-none"
          style={{
            filter: `${isDark ? "brightness(1.1)" : ""} drop-shadow(0 1px 2px rgba(0,128,128,0.1))`,
          }}
          priority
        />
      </div>
    </Link>
  );
}
