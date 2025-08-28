"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { Button, Logo } from "@bitsacco/ui";
import {
  ListIcon,
  XIcon,
  UserIcon,
  SignOutIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";

const navigation = [
  {
    name: "Membership",
    href: "/dashboard/membership",
    icon: ShieldCheckIcon,
  },
  // {
  //   name: "Personal Savings",
  //   href: "/dashboard/personal",
  //   icon: WalletIcon,
  // },
  // {
  //   name: "Chamas",
  //   href: "/dashboard/chamas",
  //   icon: UsersThreeIcon,
  // },
  // {
  //   name: "Account",
  //   href: "/dashboard/account",
  //   icon: GearIcon,
  // },
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
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-50 ${sidebarOpen ? "block" : "hidden"} lg:hidden`}
      >
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-75 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-72 bg-slate-800/95 backdrop-blur-xl shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
            <Logo className="h-10" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1.5 rounded-lg hover:bg-slate-700/50"
            >
              <XIcon size={24} weight="bold" />
            </button>
          </div>
          <SidebarContent
            pathname={pathname}
            onSignOut={handleSignOut}
            session={session}
          />
        </div>
      </div>

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
        {/* Mobile header */}
        <div className="lg:hidden bg-slate-800/90 backdrop-blur-xl shadow-sm border-b border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1"
            >
              <ListIcon size={24} weight="bold" />
            </button>
            <Logo className="h-6" />
            <div className="w-8"></div>
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
}: {
  pathname: string;
  onSignOut: () => void;
  session: Session | null;
}) {
  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-teal-500/20 text-teal-300 shadow-lg shadow-teal-500/10"
                  : "text-gray-300 hover:bg-slate-700/60 hover:text-white"
              }`}
            >
              <Icon
                size={22}
                weight={isActive ? "fill" : "regular"}
                className={`mr-4 flex-shrink-0 ${
                  isActive
                    ? "text-teal-400"
                    : "text-gray-400 group-hover:text-gray-300"
                }`}
              />
              <span className="truncate">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1 h-5 bg-teal-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-slate-700 p-4">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
            <UserIcon size={18} weight="fill" className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-gray-100 truncate">
              {session?.user?.name || "User"}
            </p>
            <p className="text-sm text-gray-400 truncate">
              {session?.user?.id
                ? `ID: ${session.user.id.slice(0, 8)}...`
                : "Member"}
            </p>
          </div>
        </div>
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
