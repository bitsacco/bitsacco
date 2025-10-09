"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@bitsacco/ui";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
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
import type { Chama } from "@bitsacco/core";

export default function JoinChamaPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const chamaId = params.id as string;
  const [chama, setChama] = useState<Chama | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (authStatus === "loading") return;

    if (authStatus === "unauthenticated") {
      // Redirect to login with callback URL
      const callbackUrl = Routes.JOIN_CHAMA(chamaId);
      router.push(`${Routes.LOGIN}?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
  }, [authStatus, chamaId, router]);

  // Fetch chama details
  useEffect(() => {
    const fetchChamaDetails = async () => {
      if (!chamaId || authStatus !== "authenticated") return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/chama/details?chamaId=${encodeURIComponent(chamaId)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch chama details");
        }

        setChama(data.data);

        // Check if user is already a member
        const currentUserId = session?.user?.id;
        if (currentUserId && data.data.members) {
          const isAlreadyMember = data.data.members.some(
            (member: { userId: string }) => member.userId === currentUserId
          );
          if (isAlreadyMember) {
            setJoined(true);
          }
        }
      } catch (err) {
        console.error("Error fetching chama details:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load chama details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChamaDetails();
  }, [chamaId, session?.user?.id, authStatus]);

  const handleJoinChama = async () => {
    if (!chamaId || !session?.user?.id) return;

    try {
      setJoining(true);
      setError(null);

      const response = await fetch(Routes.API.CHAMA.JOIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chamaId,
          userId: session.user.id,
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
    router.push(Routes.CHAMA_DETAILS(chamaId));
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

  // Show loading while fetching chama details
  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8">
            <LoadingSkeleton className="h-10 w-10 rounded-lg mb-4" />
            <LoadingSkeleton className="h-8 w-64 mb-2" />
            <LoadingSkeleton className="h-4 w-96" />
          </div>

          {/* Card skeleton */}
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-8">
            <div className="flex flex-col items-center text-center">
              <LoadingSkeleton className="w-20 h-20 rounded-xl mb-6" />
              <LoadingSkeleton className="h-8 w-48 mb-3" />
              <LoadingSkeleton className="h-4 w-72 mb-6" />
              <LoadingSkeleton className="h-12 w-40 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !chama) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <EmptyState
            icon={
              <WarningIcon size={48} weight="duotone" className="text-red-400" />
            }
            title="Unable to Load Chama"
            description={
              error ||
              "We couldn't find this chama or you don't have permission to view it."
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
                You&apos;re In!
              </h1>
              <p className="text-gray-400 mb-8 max-w-md">
                You&apos;re now a member of <strong className="text-teal-400">{chama.name}</strong>.
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
              Join {chama.name}
            </h1>

            {/* Description */}
            {chama.description && (
              <p className="text-gray-400 mb-6 max-w-md">{chama.description}</p>
            )}

            {/* Chama Stats */}
            <div className="grid grid-cols-2 gap-6 w-full max-w-md mb-8">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <p className="text-sm text-gray-400 mb-1">Members</p>
                <p className="text-2xl font-bold text-gray-100">
                  {chama.members?.length || 0}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                <p className="text-sm text-gray-400 mb-1">Your Role</p>
                <p className="text-lg font-semibold text-teal-400">Member</p>
              </div>
            </div>

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
                {joining ? "Joining..." : "Join Chama"}
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
            By joining this chama, you&apos;ll be able to save collectively with other members
            and participate in group investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
