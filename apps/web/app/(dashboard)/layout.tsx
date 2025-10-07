"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { Button, Logo } from "@bitsacco/ui";
import type { User as CoreUser } from "@bitsacco/core";
import {
  ListIcon,
  XIcon,
  UserIcon,
  SignOutIcon,
  ShieldCheckIcon,
  WalletIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { Routes } from "@/lib/routes";

const navigation = [
  {
    name: "Membership",
    href: Routes.MEMBERSHIP,
    icon: ShieldCheckIcon,
  },
  {
    name: "Personal Savings",
    href: Routes.PERSONAL,
    icon: WalletIcon,
  },
  {
    name: "Chama Savings",
    href: Routes.CHAMAS,
    icon: UsersThreeIcon,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: Routes.HOME });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800">
      {/* Mobile sidebar - Full screen overlay like navbar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-800/95 backdrop-blur-xl lg:hidden">
          <div className="flex h-screen flex-col bg-slate-800/95 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
              <Logo className="h-10" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-slate-700/50"
                aria-label="Close menu"
              >
                <XIcon size={24} weight="bold" className="text-gray-300" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent
                pathname={pathname}
                onSignOut={handleSignOut}
                session={session}
                isMobile={true}
                onNavigate={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:w-72 lg:flex lg:flex-col">
        <div className="flex flex-col h-full bg-slate-800/90 backdrop-blur-xl shadow-sm border-r border-slate-700">
          <div className="flex items-center px-6 py-5 border-b border-slate-700">
            <Logo className="h-10" />
          </div>
          <SidebarContent
            pathname={pathname}
            onSignOut={handleSignOut}
            session={session}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72 flex flex-col min-h-screen">
        {/* Mobile header - Hamburger on the right like navbar */}
        <div className="lg:hidden bg-slate-800/90 backdrop-blur-xl shadow-sm border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo className="h-8" />
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex size-10 items-center justify-center rounded-lg transition-colors hover:bg-slate-700/50"
              aria-label="Open main menu"
            >
              <ListIcon size={24} weight="bold" className="text-gray-300" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onSignOut,
  session,
  isMobile = false,
  onNavigate,
}: {
  pathname: string;
  onSignOut: () => void;
  session: Session | null;
  isMobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div
      className={`flex flex-col flex-1 overflow-y-auto ${isMobile ? "px-6 py-8" : ""}`}
    >
      <nav
        className={`${isMobile ? "space-y-1" : "flex-1 px-4 py-6 space-y-2"}`}
      >
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={`group flex items-center transition-all duration-200 ${
                isMobile
                  ? `px-4 py-3 text-xl font-semibold rounded-lg ${
                      isActive
                        ? "bg-teal-500/20 text-teal-300"
                        : "text-white hover:bg-slate-700/50"
                    }`
                  : `px-4 py-3 text-base font-medium rounded-xl ${
                      isActive
                        ? "bg-teal-500/20 text-teal-300 shadow-lg shadow-teal-500/10"
                        : "text-gray-300 hover:bg-slate-700/60 hover:text-white"
                    }`
              }`}
            >
              <Icon
                size={isMobile ? 24 : 22}
                weight={isActive ? "fill" : "regular"}
                className={`${isMobile ? "mr-3" : "mr-4"} flex-shrink-0 ${
                  isActive
                    ? "text-teal-400"
                    : "text-gray-400 group-hover:text-gray-300"
                }`}
              />
              <span className="truncate">{item.name}</span>
              {!isMobile && isActive && (
                <div className="ml-auto w-1 h-5 bg-teal-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section - Fixed at bottom */}
      <div
        className={`flex-shrink-0 gap-2 border-t border-slate-700 ${isMobile ? "px-6 py-4 mt-8" : "p-4"}`}
      >
        <Link
          key={"account-settings"}
          href={Routes.ACCOUNT}
          onClick={onNavigate}
          className={`group flex items-center transition-all duration-200 mb-4 ${
            isMobile
              ? `px-4 py-3 text-xl font-semibold rounded-lg text-white hover:bg-slate-700/50`
              : `px-4 py-3 text-base font-medium rounded-xl text-gray-300 hover:bg-slate-700/60 hover:text-white`
          }`}
        >
          <div
            className={`flex items-center space-x-3 ${isMobile ? "" : "px-2"}`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
              <UserIcon size={18} weight="fill" className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-gray-100 truncate">
                {(session?.user as CoreUser)?.profile?.name || "User"}
              </p>
              <p className="text-sm text-gray-400 truncate">
                {session?.user?.id
                  ? `ID: ${session.user.id.slice(0, 8)}...`
                  : "Member"}
              </p>
            </div>
          </div>
          {!isMobile && pathname.startsWith(Routes.ACCOUNT) && (
            <div className="ml-auto w-1 h-5 bg-teal-400 rounded-full" />
          )}
        </Link>
        <Button
          variant="outline"
          size="md"
          fullWidth
          onClick={onSignOut}
          className="!bg-slate-700/60 !text-gray-200 !border-slate-600 hover:!bg-red-500/20 hover:!text-red-300 hover:!border-red-500/50 transition-all duration-200"
        >
          <SignOutIcon size={18} weight="bold" className="mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
