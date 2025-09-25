"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@bitsacco/ui";
import { useChamaDetails } from "@/hooks/chama";
import { DepositModal } from "@/components/chama/DepositModal";
import { InviteMembersModal } from "@/components/chama/InviteMembersModal";
import { BaseCard } from "@/components/ui/base-card";
import { StatsCard } from "@/components/ui/stats-card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState, CompactEmptyState } from "@/components/ui/empty-state";
import { formatSats } from "@/lib/utils/format";
import {
  ArrowLeftIcon,
  UsersThreeIcon,
  EyeIcon,
  EyeSlashIcon,
  PlusIcon,
  DownloadIcon,
  CaretDownIcon,
  ShieldCheckIcon,
  WarningIcon,
  TrendUpIcon,
  ReceiptIcon,
  UserIcon,
  CrownIcon,
} from "@phosphor-icons/react";
import { ChamaTxStatus, ChamaMemberRole } from "@bitsacco/core";
import type { ChamaWalletTx } from "@bitsacco/core";

export default function ChamaDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const chamaId = params.id as string;

  const [hideBalances, setHideBalances] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { chama, transactions, memberProfiles, isAdmin, loading, error } =
    useChamaDetails({
      chamaId,
    });

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <LoadingSkeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <LoadingSkeleton className="h-8 w-48" />
              <LoadingSkeleton className="h-4 w-80" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LoadingSkeleton className="w-24 h-10" />
            <LoadingSkeleton className="w-32 h-10" />
            <LoadingSkeleton className="w-32 h-10" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="mb-8 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <LoadingSkeleton className="w-14 h-14 rounded-xl" />
            <div className="space-y-3 flex-1">
              <LoadingSkeleton className="h-8 w-48" />
              <LoadingSkeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <LoadingSkeleton className="h-4 w-24 mx-auto" />
                <LoadingSkeleton className="h-8 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-6">
          <LoadingSkeleton className="h-64" />
          <LoadingSkeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !chama) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <EmptyState
          icon={
            <WarningIcon size={36} weight="duotone" className="text-red-400" />
          }
          title="Unable to Load Chama"
          description="We encountered an error while loading this chama's details. Please try again or check your connection."
          action={{
            label: "Back to Chamas",
            onClick: () => router.push("/dashboard/chamas"),
            variant: "tealPrimary",
          }}
        />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: ChamaTxStatus) => {
    const statusMap: Record<
      ChamaTxStatus,
      { label: string; color: string; bgColor: string }
    > = {
      [ChamaTxStatus.PENDING]: {
        label: "Pending",
        color: "text-yellow-300",
        bgColor: "bg-yellow-500/20 border-yellow-500/30",
      },
      [ChamaTxStatus.PROCESSING]: {
        label: "Processing",
        color: "text-blue-300",
        bgColor: "bg-blue-500/20 border-blue-500/30",
      },
      [ChamaTxStatus.FAILED]: {
        label: "Failed",
        color: "text-red-300",
        bgColor: "bg-red-500/20 border-red-500/30",
      },
      [ChamaTxStatus.COMPLETE]: {
        label: "Complete",
        color: "text-green-300",
        bgColor: "bg-green-500/20 border-green-500/30",
      },
      [ChamaTxStatus.APPROVED]: {
        label: "Approved",
        color: "text-indigo-300",
        bgColor: "bg-indigo-500/20 border-indigo-500/30",
      },
      [ChamaTxStatus.REJECTED]: {
        label: "Rejected",
        color: "text-red-300",
        bgColor: "bg-red-500/20 border-red-500/30",
      },
      [ChamaTxStatus.UNRECOGNIZED]: {
        label: "Unknown",
        color: "text-gray-400",
        bgColor: "bg-gray-500/20 border-gray-500/30",
      },
    };

    const config = statusMap[status] || statusMap[ChamaTxStatus.PENDING];
    return (
      <span
        className={`px-3 py-1.5 text-xs font-medium rounded-full border ${config.color} ${config.bgColor}`}
      >
        {config.label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      deposit: {
        label: "Deposit",
        color: "text-emerald-300",
        bgColor: "bg-emerald-500/20 border-emerald-500/30",
      },
      withdrawal: {
        label: "Withdrawal",
        color: "text-orange-300",
        bgColor: "bg-orange-500/20 border-orange-500/30",
      },
      transfer: {
        label: "Transfer",
        color: "text-blue-300",
        bgColor: "bg-blue-500/20 border-blue-500/30",
      },
    };

    const config = typeMap[type as keyof typeof typeMap] || {
      label: type,
      color: "text-gray-400",
      bgColor: "bg-gray-500/20 border-gray-500/30",
    };

    return (
      <span
        className={`px-3 py-1.5 text-xs font-medium rounded-full border ${config.color} ${config.bgColor}`}
      >
        {config.label}
      </span>
    );
  };

  const getMemberRoleIcon = (roles: ChamaMemberRole[]) => {
    if (roles.includes(ChamaMemberRole.Admin)) {
      return <CrownIcon size={16} className="text-yellow-400" />;
    }
    return <UserIcon size={16} className="text-gray-400" />;
  };

  const groupBalance = transactions?.groupMeta?.groupBalance || 0;
  const memberBalance = transactions?.memberMeta?.memberBalance || 0;
  const txList = transactions?.ledger?.transactions || [];

  // Check if chama needs more admins
  const adminCount = chama.members.filter((m) =>
    m.roles.includes(ChamaMemberRole.Admin),
  ).length;
  const needsMoreAdmins = chama.members.length > 2 && adminCount < 2;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="tealOutline"
              size="sm"
              onClick={() => router.push("/dashboard/chamas")}
              className="p-2"
            >
              <ArrowLeftIcon size={20} />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">
                  {chama.name}
                </h1>
                {isAdmin && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-full">
                    <ShieldCheckIcon size={14} className="text-yellow-400" />
                    <span className="text-xs font-medium text-yellow-300">
                      Admin
                    </span>
                  </div>
                )}
              </div>
              {chama.description && (
                <p className="text-sm sm:text-base text-gray-400 mt-2">
                  {chama.description}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="tealOutline"
              size="sm"
              onClick={() => setHideBalances(!hideBalances)}
            >
              {hideBalances ? (
                <EyeSlashIcon size={16} />
              ) : (
                <EyeIcon size={16} />
              )}
              <span className="hidden sm:inline ml-2">
                {hideBalances ? "Show" : "Hide"}
              </span>
            </Button>
            {isAdmin && (
              <Button
                variant="tealOutline"
                size="sm"
                onClick={() => setShowInviteModal(true)}
              >
                <PlusIcon size={16} />
                <span className="hidden sm:inline ml-2">Invite</span>
              </Button>
            )}
            <Button
              variant="tealOutline"
              size="sm"
              onClick={() => setShowMembers(!showMembers)}
            >
              <UsersThreeIcon size={16} />
              <span className="ml-2">{chama.members.length} members</span>
              <CaretDownIcon
                size={12}
                className={`ml-1 transition-transform duration-200 ${showMembers ? "rotate-180" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Admin warning */}
      {needsMoreAdmins && isAdmin && (
        <div className="mb-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
          <BaseCard className="!border-yellow-500/50 !bg-gradient-to-r !from-yellow-900/30 !to-amber-900/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <WarningIcon size={20} className="text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                  Additional Admin Needed
                </h3>
                <p className="text-sm text-yellow-200/80 leading-relaxed">
                  For enhanced security, chamas with 3 or more members should
                  have at least 2 admins. Consider promoting a trusted member to
                  help manage this chama.
                </p>
              </div>
            </div>
          </BaseCard>
        </div>
      )}

      {/* Members dropdown */}
      {showMembers && (
        <div className="mb-6 animate-in fade-in-50 slide-in-from-top-4 duration-300">
          <BaseCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-100">Members</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <UsersThreeIcon size={16} />
                <span>{memberProfiles?.members.length || 0} total</span>
              </div>
            </div>

            <div className="space-y-4">
              {memberProfiles?.members.map((member, index) => (
                <div
                  key={member.userId}
                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500/30 to-blue-500/30 rounded-xl flex items-center justify-center border border-teal-500/20">
                      <span className="text-sm font-bold text-teal-300">
                        {member.name?.[0]?.toUpperCase() ||
                          member.userId.slice(0, 1).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-100">
                          {member.name || "Unknown Member"}
                        </p>
                        {getMemberRoleIcon(member.roles)}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {member.phoneNumber ||
                          member.userId.slice(0, 12) + "..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {member.roles.includes(ChamaMemberRole.Admin) && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-full">
                        <CrownIcon size={12} className="text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-300">
                          Admin
                        </span>
                      </div>
                    )}
                    {isAdmin &&
                      !member.roles.includes(ChamaMemberRole.Admin) && (
                        <Button
                          variant="tealOutline"
                          size="sm"
                          className="text-xs"
                        >
                          Promote
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </BaseCard>
        </div>
      )}

      {/* Chama Statistics */}
      <StatsCard
        title="Chama Overview"
        description="Financial summary and key metrics for this investment group"
        icon={<TrendUpIcon size={28} weight="fill" className="text-teal-400" />}
        stats={[
          {
            label: "Group Balance",
            value: hideBalances
              ? "•••••"
              : formatSats(Math.floor(groupBalance / 1000)),
            className: "text-emerald-300",
          },
          {
            label: "Your Contribution",
            value: hideBalances
              ? "•••••"
              : formatSats(Math.floor(memberBalance / 1000)),
            className: "text-teal-300",
          },
          {
            label: "Total Members",
            value: chama.members.length.toLocaleString(),
            className: "text-gray-100",
          },
          {
            label: "Total Transactions",
            value: txList.length.toLocaleString(),
            className: "text-gray-100",
          },
        ]}
      />

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="tealPrimary"
            size="lg"
            onClick={() => setShowDepositModal(true)}
            fullWidth
          >
            <PlusIcon size={20} weight="bold" />
            Deposit Funds
          </Button>
          <Button variant="tealOutline" size="lg" fullWidth>
            <DownloadIcon size={20} />
            Request Withdrawal
          </Button>
        </div>
      </div>

      {/* Transactions History */}
      <BaseCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
              <ReceiptIcon size={20} className="text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100">
                Transaction History
              </h2>
              <p className="text-sm text-gray-400">
                All group financial activity
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {txList.length} transaction{txList.length !== 1 ? "s" : ""}
          </div>
        </div>

        {txList.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Mobile-friendly transaction list */}
              <div className="sm:hidden space-y-4">
                {txList.map((tx: ChamaWalletTx, index) => {
                  const member = memberProfiles?.members.find(
                    (m) => m.userId === tx.memberId,
                  );
                  return (
                    <div
                      key={tx.id}
                      className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/50 animate-in fade-in-50 slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(tx.status)}
                          {getTypeBadge(tx.type)}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-100">
                            {formatSats(Math.floor(tx.amountMsats / 1000))} SATS
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(tx.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-300">
                            {member?.name || "Unknown Member"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {tx.reference || "No description"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {txList.map((tx: ChamaWalletTx, index) => {
                      const member = memberProfiles?.members.find(
                        (m) => m.userId === tx.memberId,
                      );
                      return (
                        <tr
                          key={tx.id}
                          className="hover:bg-slate-700/20 transition-colors duration-200 animate-in fade-in-50 slide-in-from-bottom-4"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            {getStatusBadge(tx.status)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            {getTypeBadge(tx.type)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-100">
                              {formatSats(Math.floor(tx.amountMsats / 1000))}{" "}
                              SATS
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {member?.name || "Unknown"}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-400 truncate max-w-xs">
                              {tx.reference || "-"}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(tx.createdAt)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <CompactEmptyState
            icon={
              <ReceiptIcon
                size={32}
                weight="duotone"
                className="text-gray-500"
              />
            }
            title="No Transactions Yet"
            description="This chama hasn't made any transactions yet. Start by making a deposit to get things going!"
          />
        )}
      </BaseCard>

      {/* Modals */}
      {showDepositModal && chama && (
        <DepositModal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          chama={chama}
        />
      )}

      {showInviteModal && chama && (
        <InviteMembersModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          chamaId={chama.id}
          chamaName={chama.name}
        />
      )}
    </div>
  );
}
