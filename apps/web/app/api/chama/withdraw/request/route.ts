import { NextRequest, NextResponse } from "next/server";
import { type ChamaWithdrawRequest, TransactionType } from "@bitsacco/core";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

/**
 * POST /api/chama/withdraw/request
 * Create a withdrawal request that requires admin approval
 */
export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { chamaId, amount } = body;

    // Validate required fields
    if (!chamaId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 },
      );
    }

    // Validate amount limits
    if (amount < 100) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is KES 100" },
        { status: 400 },
      );
    }

    // Check if user is a member of the chama
    const chamaResponse = await client.chamas.getChama({ chamaId });

    if (!chamaResponse.data) {
      return NextResponse.json({ error: "Chama not found" }, { status: 404 });
    }

    const chama = chamaResponse.data;
    const member = chama.members.find(
      (m: { userId: string }) => m.userId === session.user.id,
    );

    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this chama" },
        { status: 403 },
      );
    }

    // Create withdrawal request transaction
    const withdrawRequest: ChamaWithdrawRequest = {
      chamaId,
      memberId: session.user.id,
      amountFiat: amount,
      reference: `Withdrawal request by ${session.user.id}`,
    };

    console.log("[CHAMA WITHDRAW REQUEST] Creating withdrawal request:", {
      chamaId,
      memberId: session.user.id,
      amount,
    });

    const response = await client.chamas.createWithdrawal(withdrawRequest);

    if (!response.data) {
      throw new Error("Failed to create withdrawal request");
    }

    console.log("[CHAMA WITHDRAW REQUEST] Withdrawal request created:", {
      txId: response.data.txId,
      status: response.data.ledger?.transactions?.[0]?.status,
    });

    // SMS notifications are handled automatically by the backend
    // No need to send notifications manually from the frontend

    return NextResponse.json({
      success: true,
      data: {
        ...response.data,
        withdrawalState: "pending_approval",
        message: "Withdrawal request submitted for admin approval",
      },
    });
  } catch (error) {
    console.error("[CHAMA WITHDRAW REQUEST] Error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create withdrawal request",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/chama/withdraw/request
 * Get withdrawal requests for a chama (with optional filters)
 */
export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const chamaId = searchParams.get("chamaId");
    const status = searchParams.get("status");
    const memberId = searchParams.get("memberId");

    if (!chamaId) {
      return NextResponse.json(
        { error: "Chama ID is required" },
        { status: 400 },
      );
    }

    // Get chama to check membership
    const chamaResponse = await client.chamas.getChama({ chamaId });

    if (!chamaResponse.data) {
      return NextResponse.json({ error: "Chama not found" }, { status: 404 });
    }

    const chama = chamaResponse.data;
    const member = chama.members.find(
      (m: { userId: string }) => m.userId === session.user.id,
    );

    if (!member) {
      return NextResponse.json(
        { error: "You are not a member of this chama" },
        { status: 403 },
      );
    }

    // Get transactions (withdrawals)
    const txResponse = await client.chamas.getTransactions({
      chamaId,
      memberId: memberId || undefined,
      pagination: {
        page: 0,
        size: 50,
      },
    });

    if (!txResponse.data?.ledger) {
      return NextResponse.json({
        success: true,
        data: {
          withdrawals: [],
          total: 0,
        },
      });
    }

    // Filter for withdrawal transactions
    let withdrawals = txResponse.data.ledger.transactions.filter(
      (tx: { type: TransactionType }) => tx.type === TransactionType.WITHDRAW,
    );

    // Apply status filter if provided
    if (status) {
      const statusValue = parseInt(status);
      withdrawals = withdrawals.filter(
        (tx: { status: number }) => tx.status === statusValue,
      );
    }

    // Check if user is admin
    const isAdmin = member.roles.includes(1); // ChamaMemberRole.Admin = 1

    // If not admin, only show their own withdrawals
    if (!isAdmin && !memberId) {
      withdrawals = withdrawals.filter(
        (tx: { memberId: string }) => tx.memberId === session.user.id,
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        withdrawals,
        total: withdrawals.length,
        isAdmin,
      },
    });
  } catch (error) {
    console.error("[CHAMA WITHDRAW REQUEST GET] Error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch withdrawal requests",
      },
      { status: 500 },
    );
  }
}
