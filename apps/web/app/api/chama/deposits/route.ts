import { NextRequest, NextResponse } from "next/server";
import type { OnrampSwapSource } from "@bitsacco/core";
import { Currency, type ChamaDepositRequest } from "@bitsacco/core";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import { INTERNAL_USER_ID } from "@/lib/config";

// Helper function to format phone for M-Pesa (from webapp)
function digitizePhone({
  phone,
  noplus,
  nospace,
}: {
  phone: string;
  noplus?: boolean;
  nospace?: boolean;
}): string {
  let formatted = phone.replace(/[^\d+]/g, "");

  if (noplus && formatted.startsWith("+")) {
    formatted = formatted.substring(1);
  }

  if (nospace) {
    formatted = formatted.replace(/\s/g, "");
  }

  return formatted;
}

export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      chamaId,
      amount,
      paymentMethod,
      paymentDetails,
      sharesSubscriptionTracker,
      reference,
    } = body;

    // Validate required fields
    if (!chamaId || !amount || amount <= 0 || !sharesSubscriptionTracker) {
      return NextResponse.json(
        {
          error: "Invalid request parameters",
        },
        { status: 400 },
      );
    }

    let onramp: OnrampSwapSource | undefined;

    // Process payment method exactly like webapp
    // Reference: /home/okj/bitsacco/webapp/src/components/modal/SharesTxModal.tsx:53-77
    if (paymentMethod === "mpesa") {
      const phone = paymentDetails?.phone || "";

      if (!phone) {
        return NextResponse.json(
          {
            error: "Phone number required for M-Pesa payment",
          },
          { status: 400 },
        );
      }

      onramp = {
        currency: Currency.KES,
        origin: {
          phone: digitizePhone({ phone, noplus: true, nospace: true }),
        },
      };
    } else if (paymentMethod === "lightning") {
      // Lightning payment - no onramp needed
      onramp = undefined;
    } else {
      return NextResponse.json(
        {
          error: `Unsupported payment method: ${paymentMethod}`,
        },
        { status: 400 },
      );
    }

    // Create chama deposit request exactly like webapp
    // Reference: /home/okj/bitsacco/webapp/src/components/modal/SharesTxModal.tsx:78-92
    const depositRequest: ChamaDepositRequest = {
      amountFiat: amount,
      chamaId,
      memberId: INTERNAL_USER_ID,
      reference: reference || `Share subscription : (${amount / 1000} shares)`,
      onramp,
      context: {
        sharesSubscriptionTracker, // Critical linking field
      },
    };

    console.log("Creating chama deposit:", {
      chamaId,
      amount,
      paymentMethod,
      sharesSubscriptionTracker,
      memberId: INTERNAL_USER_ID,
    });

    // Call the backend API directly
    const response = await fetch(`${process.env.API_URL}/chama/deposits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(depositRequest),
    });

    if (!response.ok) {
      throw new Error(
        `Backend API error: ${response.status} ${response.statusText}`,
      );
    }

    const responseData = await response.json();

    console.log("Chama deposit response:", {
      hasData: !!responseData,
      hasLedger: !!responseData?.ledger,
      hasTransactions: !!responseData?.ledger?.transactions,
      firstTx: responseData?.ledger?.transactions?.[0],
      hasLightning: !!responseData?.ledger?.transactions?.[0]?.lightning,
      lightningData: responseData?.ledger?.transactions?.[0]?.lightning,
      fullResponse: JSON.stringify(responseData, null, 2).substring(0, 500),
    });

    // Log COMPLETE response data
    console.log("[CHAMA DEPOSITS API] FULL RESPONSE DATA:", responseData);
    console.log(
      "[CHAMA DEPOSITS API] FULL RESPONSE (stringified):",
      JSON.stringify(responseData, null, 2),
    );

    if (!responseData) {
      throw new Error("Invalid response from chama deposit API");
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      paymentMethod,
      sharesSubscriptionTracker,
    });
  } catch (error) {
    console.error("Failed to create chama deposit:", error);
    return NextResponse.json(
      { error: "Failed to process chama deposit" },
      { status: 500 },
    );
  }
}
