import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import { INTERNAL_USER_ID } from "@/lib/config";
import type { ChamaDepositRequest } from "@bitsacco/core";
import type { OnrampSwapSource } from "@bitsacco/core";

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
        currency: "KES",
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

    // Use the chama client (matching webapp API call)
    const response = await client.chamas.createDeposit(depositRequest);

    console.log("Chama deposit response:", {
      hasData: !!response.data,
      hasLedger: !!response.data?.ledger,
      hasTransactions: !!response.data?.ledger?.transactions,
      firstTx: response.data?.ledger?.transactions?.[0],
      hasLightning: !!response.data?.ledger?.transactions?.[0]?.lightning,
      lightningData: response.data?.ledger?.transactions?.[0]?.lightning,
      fullResponse: JSON.stringify(response.data, null, 2).substring(0, 500),
    });

    // Log COMPLETE response data
    console.log("[CHAMA DEPOSITS API] FULL RESPONSE DATA:", response.data);
    console.log(
      "[CHAMA DEPOSITS API] FULL RESPONSE (stringified):",
      JSON.stringify(response.data, null, 2),
    );

    if (!response.data) {
      throw new Error("Invalid response from chama deposit API");
    }

    return NextResponse.json({
      success: true,
      data: response.data,
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
