"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@bitsacco/ui";
import { EmptyState } from "@/components/ui/empty-state";
import { Routes } from "@/lib/routes";
import {
  UsersThreeIcon,
  WarningIcon,
  CheckCircleIcon,
  UserPlusIcon,
  ArrowLeftIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";

interface InviteTokenPayload {
  chama: {
    id: string;
    name: string;
    description?: string;
  };
  member: {
    phoneNumber: string;
    roles: number[];
  };
  iat: number;
  exp: number;
}

function TokenJoinChamaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: authStatus } = useSession();

  const token = searchParams.get("t");
  const [inviteData, setInviteData] = useState<InviteTokenPayload | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Decode JWT token (without verification - backend will verify)
  const decodeToken = (token: string): InviteTokenPayload | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Failed to decode token:", err);
      return null;
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    if (authStatus === "loading") return;

    if (authStatus === "unauthenticated") {
      // Redirect to login with callback URL
      const callbackUrl = `/chama/join?t=${token}`;
      router.push(`${Routes.LOGIN}?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [authStatus, token, router]);

  // Decode and validate token
  useEffect(() => {
    if (!token) {
      setTokenError("No invite token provided");
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      setTokenError("Invalid invite token");
      return;
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      setTokenError("This invite link has expired");
      return;
    }

    setInviteData(decoded);
  }, [token]);

  const handleJoinChama = async () => {
    if (!inviteData || !session?.user?.id || !token) return;

    try {
      setJoining(true);
      setError(null);

      const response = await fetch(Routes.API.CHAMA.JOIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chamaId: inviteData.chama.id,
          inviteToken: token, // Send token for backend validation
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to join chama");
      }

      setJoined(true);
    } catch (err) {
      console.error("Error joining chama:", err);
      setError(err instanceof Error ? err.message : "Failed to join chama");
    } finally {
      setJoining(false);
    }
  };

  const handleViewChama = () => {
    if (inviteData) {
      router.push(Routes.CHAMA_DETAILS(inviteData.chama.id));
    }
  };

  const handleBackToChamas = () => {
    router.push(Routes.CHAMAS);
  };

  // Show loading while checking authentication
  if (authStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <SpinnerGapIcon
            size={48}
            className="text-teal-400 animate-spin mx-auto mb-4"
          />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if no token or invalid token
  if (!token || tokenError || !inviteData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <EmptyState
            icon={
              <WarningIcon size={48} weight="duotone" className="text-red-400" />
            }
            title="Invalid Invite Link"
            description={
              tokenError ||
              "This invite link is invalid or has expired. Please request a new invite from the chama admin."
            }
            action={{
              label: "Back to Chamas",
              onClick: handleBackToChamas,
              variant: "tealPrimary",
            }}
          />
        </div>
      </div>
    );
  }

  // Show success state if already joined
  if (joined) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="tealOutline"
            size="sm"
            onClick={handleBackToChamas}
            className="mb-6"
          >
            <ArrowLeftIcon size={20} className="mr-2" />
            Back to Chamas
          </Button>

          <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-700/50 rounded-xl p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-teal-500/20 rounded-xl flex items-center justify-center mb-6">
                <CheckCircleIcon
                  size={48}
                  weight="fill"
                  className="text-teal-400"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-100 mb-3">
                Welcome to the Group!
              </h1>
              <p className="text-gray-400 mb-8 max-w-md">
                You&apos;ve successfully joined{" "}
                <strong className="text-teal-400">{inviteData.chama.name}</strong>.
                Start saving and building wealth together with your group.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  variant="tealPrimary"
                  size="lg"
                  onClick={handleViewChama}
                  className="shadow-lg shadow-teal-500/20"
                >
                  View Chama Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBackToChamas}
                  className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 hover:!border-slate-500"
                >
                  Back to All Chamas
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show join invitation
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="tealOutline"
          size="sm"
          onClick={handleBackToChamas}
          className="mb-6"
        >
          <ArrowLeftIcon size={20} className="mr-2" />
          Back to Chamas
        </Button>

        <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-700/50 rounded-xl p-8">
          <div className="flex flex-col items-center text-center">
            {/* Chama Icon */}
            <div className="w-20 h-20 bg-teal-500/20 rounded-xl flex items-center justify-center mb-6">
              <UsersThreeIcon
                size={48}
                weight="fill"
                className="text-teal-400"
              />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-100 mb-3">
              Join {inviteData.chama.name}
            </h1>

            {/* Description */}
            {inviteData.chama.description && (
              <p className="text-gray-400 mb-6 max-w-md">
                {inviteData.chama.description}
              </p>
            )}

            {/* Invite Info */}
            <div className="w-full max-w-md mb-8">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <p className="text-sm text-gray-400 mb-2">You&apos;re joining as</p>
                <p className="text-lg font-semibold text-teal-400">
                  {inviteData.member.phoneNumber}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Role: {inviteData.member.roles.includes(1) ? "Admin" : "Member"}
                </p>
              </div>
            </div>

            {/* Token Expiry Info */}
            {inviteData.exp && (
              <p className="text-xs text-gray-500 mb-6">
                This invite expires on{" "}
                {new Date(inviteData.exp * 1000).toLocaleString()}
              </p>
            )}

            {/* Error Message */}
            {error && (
              <div className="w-full max-w-md mb-6 rounded-lg bg-red-500/10 border border-red-500/30 p-4">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Join Button */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="tealPrimary"
                size="lg"
                onClick={handleJoinChama}
                disabled={joining}
                loading={joining}
                className="shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
              >
                <UserPlusIcon size={20} weight="bold" />
                {joining ? "Joining..." : "Accept Invitation"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleBackToChamas}
                disabled={joining}
                className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 hover:!border-slate-500"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-sm text-blue-300 leading-relaxed text-center">
            By accepting this invitation, you&apos;ll be able to save collectively with other members
            and participate in group investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TokenJoinChamaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center">
            <SpinnerGapIcon
              size={48}
              className="text-teal-400 animate-spin mx-auto mb-4"
            />
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <TokenJoinChamaContent />
    </Suspense>
  );
}
