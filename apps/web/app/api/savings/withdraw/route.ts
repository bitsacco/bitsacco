import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { WithdrawRequest, TransactionResponse } from "@/lib/types/savings";

// POST /api/savings/withdraw - Initiate withdrawal from wallet
export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: WithdrawRequest = await req.json();

    // Validate request body
    if (!body.walletId || !body.amount || !body.paymentMethod) {
      return NextResponse.json(
        { error: "Wallet ID, amount, and payment method are required" },
        { status: 400 },
      );
    }

    // Validate amount range
    if (body.amount < 10 || body.amount > 70000) {
      return NextResponse.json(
        { error: "Amount must be between KES 10 and KES 70,000" },
        { status: 400 },
      );
    }

    // Validate payment method requirements
    if (body.paymentMethod === "mpesa" && !body.phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required for M-Pesa withdrawals" },
        { status: 400 },
      );
    }

    if (body.paymentMethod === "lightning" && !body.lightningAddress) {
      return NextResponse.json(
        { error: "Lightning address is required for Lightning withdrawals" },
        { status: 400 },
      );
    }

    // Validate phone number format for M-Pesa
    if (body.phoneNumber) {
      const cleaned = body.phoneNumber.replace(/\D/g, "");
      const isValid =
        (cleaned.length === 10 && cleaned.startsWith("07")) ||
        (cleaned.length === 12 && cleaned.startsWith("254"));

      if (!isValid) {
        return NextResponse.json(
          { error: "Please enter a valid Kenyan mobile number" },
          { status: 400 },
        );
      }
    }

    // In production, this would:
    // 1. Check wallet balance
    // 2. Check if wallet allows withdrawals (not locked)
    // 3. Calculate any penalties for early withdrawal
    // 4. Initiate the withdrawal transaction

    // Mock transaction data
    const mockTransaction: TransactionResponse = {
      transaction: {
        id: `tx-${Date.now()}`,
        walletId: body.walletId,
        type: "withdraw",
        status: "processing",
        amountSats: Math.round((body.amount / 58.5) * 100000000), // Mock conversion
        amountFiat: body.amount * 100, // Convert to cents
        currency: "KES",
        paymentMethod: body.paymentMethod,
        paymentReference: `ref-${Date.now()}`,
        metadata: {
          userAgent: req.headers.get("user-agent"),
          ipAddress:
            req.headers.get("x-forwarded-for") ||
            req.headers.get("x-real-ip") ||
            "unknown",
          ...(body.lightningAddress && {
            lightningAddress: body.lightningAddress,
          }),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    return NextResponse.json(mockTransaction, { status: 201 });
  } catch (error) {
    console.error("Error initiating withdrawal:", error);
    return NextResponse.json(
      { error: "Failed to initiate withdrawal" },
      { status: 500 },
    );
  }
}
