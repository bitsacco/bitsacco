import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import { AddressType } from "@bitsacco/core";

interface CreateLightningAddressRequest {
  address: string;
  type?: AddressType;
  metadata?: {
    description?: string;
    minSendable?: number;
    maxSendable?: number;
    commentAllowed?: number;
  };
  settings?: {
    enabled?: boolean;
    allowComments?: boolean;
    notifyOnPayment?: boolean;
  };
}

// POST /api/lnaddr - Create new lightning address
export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateLightningAddressRequest = await req.json();

    // Validate request body
    if (!body.address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 },
      );
    }

    // Validate address format (only the username part)
    const addressRegex = /^[a-zA-Z0-9._-]+$/;
    if (!addressRegex.test(body.address)) {
      return NextResponse.json(
        {
          error:
            "Invalid address format. Only letters, numbers, dots, underscores, and hyphens allowed",
        },
        { status: 400 },
      );
    }

    if (body.address.length < 3 || body.address.length > 20) {
      return NextResponse.json(
        { error: "Address must be between 3 and 20 characters" },
        { status: 400 },
      );
    }

    // Set defaults for missing fields
    const createData = {
      address: body.address,
      type: body.type || AddressType.PERSONAL,
      metadata: {
        description:
          body.metadata?.description || "Send me Bitcoin via Lightning",
        minSendable: body.metadata?.minSendable || 1000, // 1 sat
        maxSendable: body.metadata?.maxSendable || 100000000, // 0.001 BTC
        commentAllowed: body.metadata?.commentAllowed || 255,
      },
      settings: {
        enabled: body.settings?.enabled ?? true,
        allowComments: body.settings?.allowComments ?? true,
        notifyOnPayment: body.settings?.notifyOnPayment ?? true,
      },
    };

    // Call the backend API
    const response =
      await client.lightningAddress.createLightningAddress(createData);

    if (response.error) {
      console.error("Backend error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    if (!response.data) {
      return NextResponse.json(
        { error: "No data received from backend" },
        { status: 500 },
      );
    }

    // Return backend response
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error("Error creating lightning address:", error);
    return NextResponse.json(
      { error: "Failed to create lightning address" },
      { status: 500 },
    );
  }
}
