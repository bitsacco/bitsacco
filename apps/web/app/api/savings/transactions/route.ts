import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { TransactionsResponse } from "@/lib/types/savings";

// GET /api/savings/transactions - Get transaction history
export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get("walletId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type"); // 'deposit' | 'withdraw'
    const status = searchParams.get("status"); // 'pending' | 'completed' | etc.

    // In production, this would fetch from the backend with proper filtering
    // For now, return mock transaction data
    const mockTransactions: TransactionsResponse = {
      transactions: [
        {
          id: "tx-1",
          walletId: walletId || "wallet-1",
          type: "deposit",
          status: "completed",
          amountSats: 85470, // ~50 KES worth
          amountFiat: 5000, // 50 KES in cents
          currency: "KES",
          paymentMethod: "mpesa",
          paymentReference: "MPE123456789",
          mpesaCheckoutRequestId: "ws_CO_123456789",
          metadata: {},
          createdAt: new Date("2024-09-20T10:30:00Z"),
          updatedAt: new Date("2024-09-20T10:32:00Z"),
          completedAt: new Date("2024-09-20T10:32:00Z"),
        },
        {
          id: "tx-2",
          walletId: walletId || "wallet-1",
          type: "deposit",
          status: "completed",
          amountSats: 170940, // ~100 KES worth
          amountFiat: 10000, // 100 KES in cents
          currency: "KES",
          paymentMethod: "lightning",
          paymentReference: "ln-invoice-abc123",
          lightningInvoice: "lnbc1000000n1p...",
          metadata: {},
          createdAt: new Date("2024-09-18T14:15:00Z"),
          updatedAt: new Date("2024-09-18T14:15:30Z"),
          completedAt: new Date("2024-09-18T14:15:30Z"),
        },
        {
          id: "tx-3",
          walletId: walletId || "wallet-2",
          type: "withdraw",
          status: "processing",
          amountSats: 85470, // ~50 KES worth
          amountFiat: 5000, // 50 KES in cents
          currency: "KES",
          paymentMethod: "mpesa",
          paymentReference: "MPE987654321",
          metadata: {},
          createdAt: new Date("2024-09-21T09:00:00Z"),
          updatedAt: new Date("2024-09-21T09:01:00Z"),
        },
        {
          id: "tx-4",
          walletId: walletId || "wallet-1",
          type: "deposit",
          status: "failed",
          amountSats: 0,
          amountFiat: 2000, // 20 KES in cents
          currency: "KES",
          paymentMethod: "mpesa",
          paymentReference: "MPE111222333",
          mpesaCheckoutRequestId: "ws_CO_111222333",
          metadata: {},
          createdAt: new Date("2024-09-19T16:45:00Z"),
          updatedAt: new Date("2024-09-19T16:47:00Z"),
          failureReason: "Payment cancelled by user",
        },
        {
          id: "tx-5",
          walletId: walletId || "wallet-3",
          type: "deposit",
          status: "completed",
          amountSats: 341880, // ~200 KES worth
          amountFiat: 20000, // 200 KES in cents
          currency: "KES",
          paymentMethod: "mpesa",
          paymentReference: "MPE444555666",
          mpesaCheckoutRequestId: "ws_CO_444555666",
          metadata: {},
          createdAt: new Date("2024-09-15T12:00:00Z"),
          updatedAt: new Date("2024-09-15T12:02:00Z"),
          completedAt: new Date("2024-09-15T12:02:00Z"),
        },
      ],
      totalCount: 5,
      hasMore: false,
    };

    // Apply filters
    let filteredTransactions = mockTransactions.transactions;

    if (walletId) {
      filteredTransactions = filteredTransactions.filter(
        (tx) => tx.walletId === walletId,
      );
    }

    if (type) {
      filteredTransactions = filteredTransactions.filter(
        (tx) => tx.type === type,
      );
    }

    if (status) {
      filteredTransactions = filteredTransactions.filter(
        (tx) => tx.status === status,
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(
      startIndex,
      endIndex,
    );

    const response: TransactionsResponse = {
      transactions: paginatedTransactions,
      totalCount: filteredTransactions.length,
      hasMore: endIndex < filteredTransactions.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}
