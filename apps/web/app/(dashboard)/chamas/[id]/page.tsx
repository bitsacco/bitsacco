"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@bitsacco/ui";
import { useChamaDetails } from "@/hooks/chama";
import { DepositModal } from "@/components/chama/DepositModal";
import { InviteMembersModal } from "@/components/chama/InviteMembersModal";
import { ChamaActions } from "@/components/chama/ChamaActions";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import {
  TransactionProvider,
  usePendingApprovals,
} from "@/lib/transactions/unified/TransactionProvider";
import { ApprovalWorkflow } from "@/components/transactions/ApprovalWorkflow";
import { BaseCard } from "@/components/ui/base-card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { BalanceDisplay } from "@/components/ui/balance-display";
import { HeaderControls } from "@/components/ui/header-controls";
import { useExchangeRate } from "@bitsacco/core";
import { apiClient } from "@/lib/auth";
import { Routes } from "@/lib/routes";
import {
  ArrowLeftIcon,
  UsersThreeIcon,
  PlusIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CaretDownIcon,
  WarningIcon,
  ReceiptIcon,
  UserIcon,
  CrownIcon,
  CopyIcon,
  PhoneIcon,
} from "@phosphor-icons/react";
import {
  ChamaMemberRole,
  ChamaTxStatus,
  ChamaTransactionType,
} from "@bitsacco/core";
import { useHideBalances } from "@/hooks/use-hide-balances";

// Component to handle pending approval workflows
function PendingApprovalsSection({ chamaId }: { chamaId: string }) {
  const { data: session } = useSession();
  const { transactions } = usePendingApprovals();
  const currentUserId = session?.user?.id || "";

  // Filter for this chama's pending withdrawals
  const chamaWithdrawals = transactions.filter(
    (tx) =>
      tx.context === "chama" &&
      tx.type === "withdrawal" &&
      tx.metadata.chamaId === chamaId &&
      tx.status === "pending_approval",
  );

  if (chamaWithdrawals.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">
        Pending Withdrawal Approvals
      </h3>
      {chamaWithdrawals.map((transaction) => (
        <ApprovalWorkflow
          key={transaction.id}
          transaction={transaction}
          currentUserId={currentUserId}
          isAdmin={true} // TODO: Check actual admin status from chama membership
          onUpdate={() => {
            // Refresh pending approvals
            window.location.reload();
          }}
          className="mb-4"
        />
      ))}
    </div>
  );
}

export default function ChamaDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const chamaId = params.id as string;

  const [showMembers, setShowMembers] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { hideBalances } = useHideBalances();

  // Unified Transaction Modal state
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [unifiedTransactionType, setUnifiedTransactionType] = useState<
    "deposit" | "withdrawal"
  >("deposit");

  const { chama, transactions, memberProfiles, metadata, loading, error } =
    useChamaDetails({
      chamaId,
    });

  // Exchange rate for KES conversion - matching gallery page
  const {
    quote,
    loading: rateLoading,
    showBtcRate,
    setShowBtcRate,
    refresh,
    kesToSats,
  } = useExchangeRate({ apiClient });

  // Get balance data from metadata
  const chamaMetadata = metadata?.meta.find((meta) => meta.chamaId === chamaId);
  const groupBalance = chamaMetadata?.groupMeta?.groupBalance || 0; // in msats
  const memberContribution =
    chamaMetadata?.memberMeta?.[0]?.memberMeta?.memberBalance || 0; // in msats

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header skeleton */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <LoadingSkeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <LoadingSkeleton className="h-8 w-48" />
                <LoadingSkeleton className="h-4 w-64" />
              </div>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto">
              <LoadingSkeleton className="h-10 w-48 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Overview Card skeleton */}
        <div className="mb-6 bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-700/50 rounded-xl p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="w-full lg:flex-1">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                <LoadingSkeleton className="w-14 h-14 rounded-xl" />
                <div className="text-center sm:text-left space-y-2">
                  <LoadingSkeleton className="h-8 w-40" />
                  <LoadingSkeleton className="h-4 w-56" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="text-center sm:text-left space-y-2">
                    <LoadingSkeleton className="h-4 w-32" />
                    <LoadingSkeleton className="h-9 w-28" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 flex-shrink-0">
              <LoadingSkeleton className="w-48 h-12 rounded-lg" />
              <LoadingSkeleton className="w-48 h-12 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Actions and Members Summary skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <LoadingSkeleton className="w-64 h-10 rounded-lg" />
              <div className="flex items-center gap-3">
                <LoadingSkeleton className="w-32 h-10 rounded-lg" />
                <LoadingSkeleton className="w-24 h-10 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 w-full lg:w-auto">
            <LoadingSkeleton className="w-full lg:w-48 h-20 rounded-xl" />
          </div>
        </div>

        {/* Transactions card skeleton */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <LoadingSkeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <LoadingSkeleton className="h-5 w-40" />
              <LoadingSkeleton className="h-4 w-48" />
            </div>
          </div>

          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-700/20 rounded-xl border border-slate-600/30"
              >
                <div className="flex items-center gap-3">
                  <LoadingSkeleton className="w-16 h-6 rounded-full" />
                  <LoadingSkeleton className="w-20 h-6 rounded-full" />
                </div>
                <div className="text-right space-y-1">
                  <LoadingSkeleton className="h-6 w-24 ml-auto" />
                  <LoadingSkeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
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
            onClick: () => router.push(Routes.CHAMAS),
            variant: "tealPrimary",
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="tealOutline"
              size="sm"
              onClick={() => router.push(Routes.CHAMAS)}
              className="p-2"
            >
              <ArrowLeftIcon size={20} />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">
                {chama.name}
              </h1>
              {chama.description && (
                <p className="text-sm text-gray-400 mt-1">
                  {chama.description}
                </p>
              )}
            </div>
          </div>

          {/* Rates Widget with Hide Balances Toggle */}
          <HeaderControls
            quote={quote}
            rateLoading={rateLoading}
            showBtcRate={showBtcRate}
            onToggleRate={() => setShowBtcRate(!showBtcRate)}
            onRefresh={refresh}
            kesToSats={kesToSats}
          />
        </div>
      </div>

      {/* Overview Card */}
      <div className="mb-6 bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-700/50 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="w-full lg:flex-1">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <UsersThreeIcon
                  size={28}
                  weight="fill"
                  className="text-teal-400"
                />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">
                  Chama Overview
                </h2>
                <p className="text-gray-400">
                  Group savings and member contributions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="text-center sm:text-left">
                <BalanceDisplay
                  balanceMsats={groupBalance}
                  label="Group Balance"
                  hideBalances={hideBalances}
                  exchangeRate={quote || undefined}
                  textColor="text-gray-100"
                  size="lg"
                />
              </div>
              <div className="text-center sm:text-left">
                <BalanceDisplay
                  balanceMsats={memberContribution}
                  label="Your Contributions"
                  hideBalances={hideBalances}
                  exchangeRate={quote || undefined}
                  textColor="text-gray-100"
                  size="lg"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-shrink-0">
            <Button
              variant="tealPrimary"
              size="lg"
              onClick={() => {
                setUnifiedTransactionType("deposit");
                setShowUnifiedModal(true);
              }}
              className="shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
            >
              <PlusIcon size={20} weight="bold" />
              DEPOSIT FUNDS
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setUnifiedTransactionType("withdrawal");
                setShowUnifiedModal(true);
              }}
              className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 hover:!border-slate-500 flex items-center justify-center gap-2"
            >
              <ArrowDownIcon size={20} weight="bold" />
              REQUEST WITHDRAWAL
            </Button>
          </div>
        </div>
      </div>

      {/* ChamaActions and Members Summary - Responsive Flex Layout */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div className="flex-1">
          <ChamaActions
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            placeholder="Search transactions..."
          />
        </div>

        {/* Members Summary Widget */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="w-full lg:w-auto flex items-center justify-between lg:justify-center gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 hover:border-slate-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <UsersThreeIcon
                  size={20}
                  className="text-blue-400 group-hover:text-blue-300 transition-colors"
                />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-100 group-hover:text-white transition-colors">
                  {chama.members.length} Members
                </div>
                <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                  {
                    chama.members.filter((m) =>
                      m.roles.includes(ChamaMemberRole.Admin),
                    ).length
                  }{" "}
                  admin
                  {chama.members.filter((m) =>
                    m.roles.includes(ChamaMemberRole.Admin),
                  ).length !== 1
                    ? "s"
                    : ""}
                </div>
              </div>
            </div>
            <CaretDownIcon
              size={16}
              className={`text-gray-400 group-hover:text-gray-300 transition-all ${showMembers ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Expanded Members List */}
      {showMembers && (
        <div className="mb-6 animate-in fade-in-50 slide-in-from-top-4 duration-300">
          <BaseCard>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <UsersThreeIcon size={20} className="text-blue-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-100 leading-tight">
                  Manage group members and their roles
                </h3>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button
                  variant="tealPrimary"
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <PlusIcon size={16} />
                  <span className="whitespace-nowrap">Invite Members</span>
                </Button>
              </div>
            </div>

            {/* Responsive grid layout for better space utilization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {chama.members.map((member) => {
                const isAdmin = member.roles.includes(ChamaMemberRole.Admin);
                const shortId = member.userId.slice(-8);

                // Get member profile from memberProfiles
                const memberProfile = memberProfiles?.members.find(
                  (profile) => profile.userId === member.userId,
                );

                const displayName = memberProfile?.name || `Member ${shortId}`;
                const contactInfo = memberProfile?.phoneNumber;
                const contactType = "phone";

                const copyToClipboard = (text: string, type: string) => {
                  navigator.clipboard.writeText(text).then(() => {
                    // You could add a toast notification here
                    console.log(`${type} copied to clipboard: ${text}`);
                  });
                };

                return (
                  <div
                    key={member.userId}
                    className="group p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50 hover:shadow-lg hover:shadow-slate-900/20"
                  >
                    {/* Header with avatar and name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-slate-600/50 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        {isAdmin ? (
                          <CrownIcon size={20} className="text-yellow-400" />
                        ) : (
                          <UserIcon size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-100 truncate">
                            {displayName}
                          </h4>
                          {isAdmin && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full flex-shrink-0">
                              <span className="text-xs text-yellow-300 font-medium">
                                Admin
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Truncated Member ID as subtitle */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-mono">
                            {shortId}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(member.userId, "Member ID")
                            }
                            className="p-1 hover:bg-slate-600/50 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Copy member ID"
                          >
                            <CopyIcon
                              size={12}
                              className="text-gray-500 hover:text-teal-400 transition-colors"
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info Section */}
                    {contactInfo && (
                      <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg mb-3 border border-slate-600/20">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <PhoneIcon
                            size={14}
                            className="text-teal-400 flex-shrink-0"
                          />
                          <span className="text-xs text-gray-300 truncate font-medium">
                            {contactInfo}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              contactInfo,
                              contactType === "phone"
                                ? "Phone number"
                                : "Email",
                            )
                          }
                          className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors ml-2 group"
                          title={`Copy ${contactType === "phone" ? "phone number" : "email"}`}
                        >
                          <CopyIcon
                            size={14}
                            className="text-gray-500 hover:text-teal-400 group-hover:text-teal-400 transition-colors"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </BaseCard>
        </div>
      )}

      {/* Transactions History - Simplified */}
      <BaseCard>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
            <ReceiptIcon size={20} className="text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">
              Recent Transactions
            </h3>
            <p className="text-sm text-gray-400">
              Latest activity in this chama
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            /* Transaction loading shimmer */
            [...Array(3)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-700/20 rounded-xl border border-slate-600/30"
              >
                <div className="flex items-center gap-3">
                  <LoadingSkeleton className="w-16 h-6 rounded-full" />
                  <LoadingSkeleton className="w-20 h-6 rounded-full" />
                </div>
                <div className="text-right space-y-1">
                  <LoadingSkeleton className="h-6 w-24 ml-auto" />
                  <LoadingSkeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
            ))
          ) : transactions?.ledger?.transactions &&
            transactions.ledger.transactions.length > 0 ? (
            /* Display actual transactions */
            transactions.ledger.transactions.slice(0, 5).map((tx) => {
              // Debug: Log transaction type to understand what's coming from API
              console.log(
                "Transaction type from API:",
                tx.type,
                "Expected DEPOSIT:",
                ChamaTransactionType.DEPOSIT,
                "Expected WITHDRAWAL:",
                ChamaTransactionType.WITHDRAWAL,
              );

              const isDeposit = tx.type === ChamaTransactionType.DEPOSIT;
              const getStatusText = (status: ChamaTxStatus): string => {
                switch (status) {
                  case ChamaTxStatus.PENDING:
                    return "pending";
                  case ChamaTxStatus.PROCESSING:
                    return "processing";
                  case ChamaTxStatus.FAILED:
                    return "failed";
                  case ChamaTxStatus.COMPLETE:
                    return "complete";
                  case ChamaTxStatus.APPROVED:
                    return "approved";
                  case ChamaTxStatus.REJECTED:
                    return "rejected";
                  default:
                    return "unknown";
                }
              };

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-slate-700/20 rounded-xl border border-slate-600/30 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isDeposit ? "bg-teal-500/20" : "bg-orange-500/20"
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowDownIcon size={16} className="text-teal-400" />
                      ) : (
                        <ArrowUpIcon size={16} className="text-orange-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        {isDeposit ? "Deposit" : "Withdrawal"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        isDeposit ? "text-teal-300" : "text-orange-300"
                      }`}
                    >
                      {hideBalances
                        ? "•••••"
                        : `${Math.floor(tx.amountMsats / 1000)} sats`}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {getStatusText(tx.status)}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            /* No transactions message */
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2">No transactions yet</p>
              <p className="text-sm text-gray-500">
                Start by making your first deposit to this chama
              </p>
            </div>
          )}
        </div>
      </BaseCard>

      {/* Legacy Deposit Modal - kept for backward compatibility */}
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

      {/* Unified Transaction Modal with Approval Workflow */}
      {chama && (
        <TransactionProvider
          apiClient={apiClient}
          initialFilter={{ contexts: ["chama"], targetId: chama.id }}
        >
          <TransactionModal
            isOpen={showUnifiedModal}
            onClose={() => setShowUnifiedModal(false)}
            context="chama"
            type={unifiedTransactionType}
            targetId={chama.id}
            targetName={chama.name}
            onSuccess={() => {
              setShowUnifiedModal(false);
              // Refresh chama data
            }}
          />

          {/* Show approval workflow for pending withdrawals */}
          <PendingApprovalsSection chamaId={chama.id} />
        </TransactionProvider>
      )}
    </div>
  );
}
