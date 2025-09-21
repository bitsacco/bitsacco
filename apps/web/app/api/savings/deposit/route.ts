import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { DepositRequest, TransactionResponse } from "@/lib/types/savings";

// POST /api/savings/deposit - Initiate deposit to wallet
export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: DepositRequest = await req.json();

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

    // Validate M-Pesa phone number if required
    if (body.paymentMethod === "mpesa" && !body.phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required for M-Pesa payments" },
        { status: 400 },
      );
    }

    // Validate phone number format
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

    // In production, this would initiate the deposit in the backend
    // For now, return mock transaction data
    const mockTransaction: TransactionResponse = {
      transaction: {
        id: `tx-${Date.now()}`,
        walletId: body.walletId,
        type: "deposit",
        status: "pending",
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
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(body.paymentMethod === "mpesa" && {
          mpesaCheckoutRequestId: `checkout-${Date.now()}`,
        }),
      },
    };

    // For Lightning payments, add invoice data
    if (body.paymentMethod === "lightning") {
      mockTransaction.lightningInvoice = `lnbc${body.amount * 1000}u1p...`; // Mock invoice
      mockTransaction.qrCodeUrl = `data:image/png;base64,iVBORw0KGgoAAAANS...`; // Mock QR code
    }

    return NextResponse.json(mockTransaction, { status: 201 });
  } catch (error) {
    console.error("Error initiating deposit:", error);
    return NextResponse.json(
      { error: "Failed to initiate deposit" },
      { status: 500 },
    );
  }
}
