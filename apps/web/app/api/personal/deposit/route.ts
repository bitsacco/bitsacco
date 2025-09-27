import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import { getExchangeRateService } from "@/lib/services/exchange-rate";
import { kesToSats } from "@bitsacco/core";
import {
  PERSONAL_DEPOSIT_LIMITS,
  LIGHTNING_DEPOSIT_LIMITS,
} from "@/lib/config";
// Define simple types inline
type PaymentMethod = "mpesa" | "lightning";
type SplitType = "automatic" | "specific";

interface DepositRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  splitType?: SplitType;
  walletIds?: string[];
  walletId?: string;
  phoneNumber?: string;
}

// POST /api/personal/deposit - Initiate deposit to wallet
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

    // Validate amount range based on payment method
    const limits =
      body.paymentMethod === "lightning"
        ? LIGHTNING_DEPOSIT_LIMITS
        : PERSONAL_DEPOSIT_LIMITS;

    if (
      body.amount < limits.MIN_AMOUNT_KES ||
      body.amount > limits.MAX_AMOUNT_KES
    ) {
      return NextResponse.json(
        {
          error: `Amount must be between KES ${limits.MIN_AMOUNT_KES} and KES ${limits.MAX_AMOUNT_KES}`,
        },
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

    // Prepare deposit data based on payment method
    const depositData: {
      userId: string;
      reference: string;
      amountMsats?: number;
      amountFiat?: number;
      onramp?: {
        currency: string;
        origin: {
          phone: string;
        };
      };
    } = {
      userId: session.user.id,
      reference: `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    if (body.paymentMethod === "mpesa" && body.phoneNumber) {
      // For M-Pesa deposits, use amountFiat (KES) and include onramp data
      depositData.amountFiat = body.amount; // Use KES amount directly

      // Format phone number to international format
      let formattedPhone = body.phoneNumber.replace(/\D/g, "");
      if (formattedPhone.startsWith("07")) {
        formattedPhone = "254" + formattedPhone.substring(1);
      }

      depositData.onramp = {
        currency: "KES",
        origin: {
          phone: formattedPhone,
        },
      };
    } else if (body.paymentMethod === "lightning") {
      // For Lightning deposits, use amountMsats (convert from KES)
      const exchangeRateService = getExchangeRateService();
      const result = await exchangeRateService.getExchangeRate();

      if (!result) {
        return NextResponse.json(
          {
            error: "Exchange rate service unavailable. Please try again later.",
          },
          { status: 503 },
        );
      }

      try {
        const amountSats = kesToSats(body.amount, result.rate);
        depositData.amountMsats = amountSats * 1000; // Convert sats to msats
      } catch (error) {
        console.error("Exchange rate validation failed:", error);
        return NextResponse.json(
          { error: "Invalid exchange rate. Please try again later." },
          { status: 503 },
        );
      }
      // No onramp data needed - backend will generate invoice directly
    }

    const response = await client.personal.depositToWallet(
      session.user.id,
      body.walletId,
      depositData,
    );

    if (response.error) {
      console.error("Backend error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    if (!response.data) {
      return NextResponse.json(
        { error: "Failed to initiate deposit" },
        { status: 500 },
      );
    }

    // Return backend response directly
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error("Error initiating deposit:", error);
    return NextResponse.json(
      { error: "Failed to initiate deposit" },
      { status: 500 },
    );
  }
}
