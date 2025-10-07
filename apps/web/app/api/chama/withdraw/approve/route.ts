import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import { type ChamaTxUpdates, TransactionType } from "@bitsacco/core";

/**
 * POST /api/chama/withdraw/approve
 * Approve or reject a withdrawal request (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { transactionId, chamaId, approved, reason } = body;

    // Validate required fields
    if (!transactionId || !chamaId || typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 },
      );
    }

    // Rejection must have a reason
    if (!approved && !reason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 },
      );
    }

    // Check if user is an admin of the chama
    const chamaResponse = await client.chamas.getChama({ chamaId });

    if (!chamaResponse.data) {
      return NextResponse.json({ error: "Chama not found" }, { status: 404 });
    }

    const chama = chamaResponse.data;
    const member = chama.members.find((m) => m.userId === session.user.id);

    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this chama" },
        { status: 403 },
      );
    }

    // Check admin permission
    const isAdmin = member.roles.includes(1); // ChamaMemberRole.Admin = 1

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Only chama admins can approve or reject withdrawals" },
        { status: 403 },
      );
    }

    // Get the transaction to verify it exists and get details
    const txResponse = await client.chamas.getTransaction(
      chamaId,
      transactionId,
    );

    if (!txResponse.data?.ledger?.transactions?.[0]) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    const transaction = txResponse.data.ledger.transactions[0];

    // Verify transaction is a withdrawal and pending approval
    if (transaction.type !== TransactionType.WITHDRAW) {
      return NextResponse.json(
        { error: "Transaction is not a withdrawal request" },
        { status: 400 },
      );
    }

    // Check if already approved/rejected
    if (transaction.status === 3) {
      // COMPLETE
      return NextResponse.json(
        { error: "Withdrawal has already been completed" },
        { status: 400 },
      );
    }

    if (transaction.status === 5) {
      // REJECTED
      return NextResponse.json(
        { error: "Withdrawal has already been rejected" },
        { status: 400 },
      );
    }

    if (transaction.status === 4) {
      // APPROVED
      return NextResponse.json(
        { error: "Withdrawal has already been approved" },
        { status: 400 },
      );
    }

    // Admin cannot approve their own withdrawal
    if (transaction.memberId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot approve your own withdrawal request" },
        { status: 403 },
      );
    }

    console.log("[CHAMA WITHDRAW APPROVE] Processing approval:", {
      transactionId,
      chamaId,
      approved,
      adminId: session.user.id,
    });

    // Update transaction with approval/rejection
    const updates: ChamaTxUpdates = {
      status: approved ? 4 : 5, // APPROVED : REJECTED
      reviews: [
        {
          memberId: session.user.id,
          review: approved ? 1 : 0, // APPROVE : REJECT
        },
      ],
      reference:
        reason || (approved ? "Approved by admin" : "Rejected by admin"),
    };

    const updateResponse = await client.chamas.updateTransaction({
      chamaId,
      txId: transactionId,
      updates,
    });

    if (!updateResponse.data) {
      throw new Error("Failed to update transaction");
    }

    console.log("[CHAMA WITHDRAW APPROVE] Transaction updated:", {
      txId: transactionId,
      newStatus: updates.status,
      approved,
    });

    // SMS notifications are handled automatically by the backend
    // No need to send notifications manually from the frontend

    return NextResponse.json({
      success: true,
      data: {
        ...updateResponse.data,
        message: approved
          ? "Withdrawal request approved. Member can now execute the withdrawal."
          : "Withdrawal request rejected.",
        withdrawalState: approved ? "approved" : "rejected",
      },
    });
  } catch (error) {
    console.error("[CHAMA WITHDRAW APPROVE] Error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process approval",
      },
      { status: 500 },
    );
  }
}
