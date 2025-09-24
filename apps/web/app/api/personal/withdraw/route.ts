import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import { PERSONAL_WITHDRAW_LIMITS } from "@/lib/config";
// Define simple types inline
type PaymentMethod = "mpesa" | "lightning";

interface WithdrawRequest {
  walletId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
  lightningAddress?: string;
  lightningInvoice?: string;
}

// POST /api/personal/withdraw - Initiate withdrawal from wallet
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
    if (
      body.amount < PERSONAL_WITHDRAW_LIMITS.MIN_AMOUNT_KES ||
      body.amount > PERSONAL_WITHDRAW_LIMITS.MAX_AMOUNT_KES
    ) {
      return NextResponse.json(
        {
          error: `Amount must be between KES ${PERSONAL_WITHDRAW_LIMITS.MIN_AMOUNT_KES} and KES ${PERSONAL_WITHDRAW_LIMITS.MAX_AMOUNT_KES}`,
        },
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

    // Note: Withdrawals use amountFiat (KES) directly, not msats conversion
    // Prepare withdraw data based on payment method
    const withdrawData: {
      userId: string;
      reference: string;
      amountFiat: number;
      offramp?: {
        currency: string;
        payout: {
          phone: string;
        };
      };
      lightning?: {
        invoice: string;
      };
      lnurlRequest?: boolean;
    } = {
      userId: session.user.id,
      reference: `wth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      amountFiat: body.amount, // Use KES amount directly
    };

    // For M-Pesa withdrawals, add offramp data
    if (body.paymentMethod === "mpesa" && body.phoneNumber) {
      // Format phone number to international format
      let formattedPhone = body.phoneNumber.replace(/\D/g, "");
      if (formattedPhone.startsWith("07")) {
        formattedPhone = "254" + formattedPhone.substring(1);
      }

      withdrawData.offramp = {
        currency: "KES",
        payout: {
          phone: formattedPhone,
        },
      };
    } else if (body.paymentMethod === "lightning") {
      if (body.lightningInvoice) {
        withdrawData.lightning = {
          invoice: body.lightningInvoice,
        };
      } else {
        // Request LNURL withdrawal if no invoice provided
        withdrawData.lnurlRequest = true;
      }
    }

    const response = await client.personal.withdrawFromWallet(
      session.user.id,
      body.walletId,
      withdrawData,
    );

    if (response.error) {
      console.error("Backend error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    if (!response.data) {
      return NextResponse.json(
        { error: "Failed to initiate withdrawal" },
        { status: 500 },
      );
    }

    // Return backend response directly without transformation
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error("Error initiating withdrawal:", error);
    return NextResponse.json(
      { error: "Failed to initiate withdrawal" },
      { status: 500 },
    );
  }
}
