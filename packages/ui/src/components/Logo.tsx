"use client";

import Image from "next/image";
import Link from "next/link";

export interface LogoProps {
  className?: string;
  isDark?: boolean;
  href?: string;
  full?: boolean;
}

export function Logo({
  className = "",
  isDark = false,
  href = "/",
  full = true,
}: LogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center group transition-all duration-200 hover:scale-105 ${className}`}
    >
      <Image
        src={full ? "/logo_full.svg" : "/logo.svg"}
        alt="Bitsacco Full Logo"
        width={202}
        height={120}
        className="object-contain"
        style={{
          filter: `${isDark ? "brightness(1.1)" : ""} drop-shadow(0 1px 2px rgba(0,128,128,0.1))`,
        }}
        priority
      />
    </Link>
  );
}
