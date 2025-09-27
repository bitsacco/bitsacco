import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

/**
 * POST /api/chama/withdraw/execute
 * Execute an approved withdrawal using MPesa or Lightning
 */
export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { transactionId, chamaId, paymentMethod, paymentDetails } = body;

    // Validate required fields
    if (!transactionId || !chamaId || !paymentMethod) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 },
      );
    }

    // Validate payment method
    if (!["mpesa", "lightning"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method. Use 'mpesa' or 'lightning'" },
        { status: 400 },
      );
    }

    // Validate payment details based on method
    if (paymentMethod === "mpesa" && !paymentDetails?.phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required for M-Pesa withdrawals" },
        { status: 400 },
      );
    }

    if (
      paymentMethod === "lightning" &&
      !paymentDetails?.lightningAddress &&
      !paymentDetails?.lightningInvoice
    ) {
      return NextResponse.json(
        {
          error:
            "Lightning address or invoice is required for Lightning withdrawals",
        },
        { status: 400 },
      );
    }

    // Get the transaction to verify status and ownership
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

    // Verify user owns this withdrawal
    if (transaction.memberId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only execute your own withdrawals" },
        { status: 403 },
      );
    }

    // Verify transaction is approved
    if (transaction.status !== 4) {
      // APPROVED = 4
      const statusMessages: Record<number, string> = {
        0: "Withdrawal is still pending",
        1: "Withdrawal is being processed",
        2: "Withdrawal has failed",
        3: "Withdrawal has already been completed",
        5: "Withdrawal has been rejected",
      };

      return NextResponse.json(
        {
          error:
            statusMessages[transaction.status] ||
            "Withdrawal is not approved for execution",
        },
        { status: 400 },
      );
    }

    console.log("[CHAMA WITHDRAW EXECUTE] Executing withdrawal:", {
      transactionId,
      chamaId,
      paymentMethod,
      amount: transaction.amountFiat,
      userId: session.user.id,
    });

    // Prepare withdrawal data based on payment method
    const withdrawData: {
      amountFiat: number;
      reference: string;
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
      lightningAddress?: string;
    } = {
      amountFiat: transaction.amountFiat || 0,
      reference: `Chama withdrawal - ${transaction.reference || transactionId}`,
    };

    if (paymentMethod === "mpesa") {
      // Format phone number for M-Pesa
      let formattedPhone = paymentDetails.phoneNumber.replace(/\D/g, "");

      // Convert to international format if needed
      if (formattedPhone.startsWith("07")) {
        formattedPhone = "254" + formattedPhone.substring(1);
      } else if (formattedPhone.startsWith("7")) {
        formattedPhone = "254" + formattedPhone;
      } else if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith("254")) {
        formattedPhone = "254" + formattedPhone;
      }

      withdrawData.offramp = {
        currency: "KES",
        payout: {
          phone: formattedPhone,
        },
      };

      console.log("[CHAMA WITHDRAW EXECUTE] M-Pesa withdrawal details:", {
        originalPhone: paymentDetails.phoneNumber,
        formattedPhone,
      });
    } else if (paymentMethod === "lightning") {
      if (paymentDetails.lightningInvoice) {
        withdrawData.lightning = {
          invoice: paymentDetails.lightningInvoice,
        };
      } else if (paymentDetails.lightningAddress) {
        // For lightning address, we might need to request an invoice first
        withdrawData.lnurlRequest = true;
        withdrawData.lightningAddress = paymentDetails.lightningAddress;
      }

      console.log("[CHAMA WITHDRAW EXECUTE] Lightning withdrawal details:", {
        hasInvoice: !!paymentDetails.lightningInvoice,
        hasAddress: !!paymentDetails.lightningAddress,
      });
    }

    // Continue the withdrawal transaction
    // This updates the existing transaction and processes the payment
    const continueResponse = await client.chamas.continueDeposit({
      chamaId,
      txId: transactionId,
      ...withdrawData,
    });

    if (!continueResponse.data) {
      throw new Error("Failed to execute withdrawal");
    }

    console.log("[CHAMA WITHDRAW EXECUTE] Withdrawal execution initiated:", {
      txId: transactionId,
      status: continueResponse.data.ledger?.transactions?.[0]?.status,
    });

    // SMS notifications are handled automatically by the backend
    // No need to send notifications manually from the frontend

    // Return response with payment details
    const responseData = {
      success: true,
      data: {
        ...continueResponse.data,
        paymentMethod,
        withdrawalState: "executing",
        message:
          paymentMethod === "mpesa"
            ? "M-Pesa withdrawal initiated. You will receive an SMS prompt to confirm."
            : "Lightning withdrawal is being processed.",
      },
    };

    // Add Lightning-specific data if present
    if (
      paymentMethod === "lightning" &&
      continueResponse.data?.ledger?.transactions?.[0]
    ) {
      const tx = continueResponse.data.ledger.transactions[0];
      if ("lightning" in tx && tx.lightning) {
        (responseData.data as Record<string, unknown>).lightning = tx.lightning;
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("[CHAMA WITHDRAW EXECUTE] Error:", error);

    // Provide user-friendly error messages
    let errorMessage = "Failed to execute withdrawal";

    if (error instanceof Error) {
      if (error.message.includes("balance")) {
        errorMessage = "Insufficient chama balance for this withdrawal";
      } else if (error.message.includes("phone")) {
        errorMessage = "Invalid phone number format";
      } else if (error.message.includes("lightning")) {
        errorMessage = "Invalid Lightning address or invoice";
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * GET /api/chama/withdraw/execute
 * Get execution status of a withdrawal
 */
export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const transactionId = searchParams.get("transactionId");
    const chamaId = searchParams.get("chamaId");

    if (!transactionId || !chamaId) {
      return NextResponse.json(
        { error: "Transaction ID and Chama ID are required" },
        { status: 400 },
      );
    }

    // Get transaction status
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

    // Map status to withdrawal state
    const withdrawalStates: Record<number, string> = {
      0: "pending_approval",
      1: "processing",
      2: "failed",
      3: "completed",
      4: "approved",
      5: "rejected",
    };

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.id,
        status: transaction.status,
        withdrawalState: withdrawalStates[transaction.status] || "unknown",
        amount: transaction.amountFiat,
        lightning: transaction.lightning,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        reference: transaction.reference,
      },
    });
  } catch (error) {
    console.error("[CHAMA WITHDRAW EXECUTE GET] Error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get withdrawal status",
      },
      { status: 500 },
    );
  }
}
