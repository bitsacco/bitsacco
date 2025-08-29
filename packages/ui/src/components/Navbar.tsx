"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BitcoinRateDisplay,
  type BitcoinRateDisplayProps,
} from "./BitcoinRateDisplay";
import { Container } from "./Container";
import { NavButton } from "./NavButton";
import { PlusGrid, PlusGridItem, PlusGridRow } from "./PlusGrid";

export interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface NavbarButton {
  text: string;
  href: string;
  variant?: "tealPrimary" | "tealOutline";
}

export interface NavbarProps {
  links?: NavLink[];
  buttons?: NavbarButton[];
  banner?: React.ReactNode;
  Logo?: React.ComponentType<{ className?: string }>;
  MenuIcon?: React.ComponentType<{ className?: string }>;
  CloseIcon?: React.ComponentType<{ className?: string }>;
  bitcoinRateProps?: BitcoinRateDisplayProps;
}

function DesktopNav({
  links = [],
  buttons = [],
}: {
  links?: NavLink[];
  buttons?: NavbarButton[];
}) {
  return (
    <nav className="relative hidden items-center gap-6 lg:flex">
      {links.map(({ href, label, external }) => (
        <Link
          key={href}
          href={href}
          className="px-3 py-2 text-sm font-semibold text-gray-100 uppercase tracking-wide transition-colors hover:text-teal-400"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {label}
        </Link>
      ))}
      {buttons.length > 0 && (
        <div className="flex items-center gap-4 ml-4">
          {buttons.map((button, index) => (
            <NavButton
              key={index}
              href={button.href}
              variant={button.variant || "tealPrimary"}
            >
              {button.text}
            </NavButton>
          ))}
        </div>
      )}
    </nav>
  );
}

function MobileNavButton({
  onClick,
  MenuIcon,
}: {
  onClick: () => void;
  MenuIcon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      onClick={onClick}
      className="flex size-10 items-center justify-center self-center rounded-lg transition-colors hover:bg-gray-800 lg:hidden"
      aria-label="Open main menu"
    >
      {MenuIcon ? (
        <MenuIcon className="size-6 text-gray-300" />
      ) : (
        <div className="size-6 text-gray-300">☰</div>
      )}
    </button>
  );
}

function MobileNav({
  isOpen,
  onClose,
  links = [],
  buttons = [],
  Logo,
  CloseIcon,
}: {
  isOpen: boolean;
  onClose: () => void;
  links?: NavLink[];
  buttons?: NavbarButton[];
  Logo?: React.ComponentType<{ className?: string }>;
  CloseIcon?: React.ComponentType<{ className?: string }>;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-800/95 backdrop-blur-xl lg:hidden">
      <div className="flex h-screen flex-col bg-slate-800/95 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          {Logo && <Logo className="h-18 w-auto" />}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-gray-800"
              aria-label="Close menu"
            >
              {CloseIcon ? (
                <CloseIcon className="size-6 text-gray-300" />
              ) : (
                <div className="size-6 text-gray-300">✕</div>
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 py-8">
          <div className="space-y-1">
            {links.map(({ href, label, external }) => (
              <div key={href}>
                <Link
                  href={href}
                  className="block rounded-lg px-4 py-3 text-xl font-semibold text-white transition-colors hover:bg-gray-800/50"
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  onClick={onClose}
                >
                  {label}
                </Link>
              </div>
            ))}
          </div>

          {buttons.length > 0 && (
            <div className="mt-8">
              <div className="flex flex-col gap-3">
                {buttons.map((button, index) => (
                  <NavButton
                    key={index}
                    href={button.href}
                    className={
                      button.variant === "tealOutline"
                        ? "inline-flex w-full items-center justify-center rounded-lg border-2 border-teal-500 bg-transparent px-8 py-3 text-base font-semibold tracking-wide text-teal-500 uppercase transition-all hover:bg-teal-500 hover:text-white"
                        : "inline-flex w-full items-center justify-center rounded-lg bg-teal-500 px-8 py-3 text-base font-semibold tracking-wide text-white uppercase transition-all hover:bg-teal-600"
                    }
                  >
                    {button.text}
                  </NavButton>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="border-t border-gray-800 px-6 py-4">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Bitsacco. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Navbar({
  links = [],
  buttons = [],
  banner,
  Logo,
  MenuIcon,
  CloseIcon,
  bitcoinRateProps,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-700/60 bg-slate-800/90 backdrop-blur-xl">
        <Container className="py-4">
          <PlusGrid>
            <PlusGridRow className="relative flex items-center">
              <div className="relative flex items-center gap-6 flex-1">
                {Logo && (
                  <PlusGridItem>
                    <Logo />
                  </PlusGridItem>
                )}
                {banner && (
                  <div className="relative hidden items-center py-3 lg:flex">
                    {banner}
                  </div>
                )}
              </div>
              {bitcoinRateProps && (
                <div className="flex justify-center flex-1">
                  <BitcoinRateDisplay {...bitcoinRateProps} />
                </div>
              )}
              <div className="flex items-center gap-2 justify-end flex-1">
                <DesktopNav links={links} buttons={buttons} />
                <MobileNavButton
                  onClick={() => setIsMobileMenuOpen(true)}
                  MenuIcon={MenuIcon}
                />
              </div>
            </PlusGridRow>
          </PlusGrid>
        </Container>
      </header>
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        links={links}
        buttons={buttons}
        Logo={Logo}
        CloseIcon={CloseIcon}
      />
    </>
  );
}
