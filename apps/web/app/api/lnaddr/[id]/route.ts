import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

interface UpdateLightningAddressRequest {
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

// GET /api/lnaddr/[id] - Get specific lightning address
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Call the backend API
    const response = await client.lightningAddress.getLightningAddress(id);

    if (response.error) {
      console.error("Backend error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    if (!response.data) {
      return NextResponse.json(
        { error: "Lightning address not found" },
        { status: 404 },
      );
    }

    // Return backend response
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching lightning address:", error);
    return NextResponse.json(
      { error: "Failed to fetch lightning address" },
      { status: 500 },
    );
  }
}

// PATCH /api/lnaddr/[id] - Update lightning address
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body: UpdateLightningAddressRequest = await req.json();

    // Call the backend API
    const response = await client.lightningAddress.updateLightningAddress(
      id,
      body,
    );

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
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error updating lightning address:", error);
    return NextResponse.json(
      { error: "Failed to update lightning address" },
      { status: 500 },
    );
  }
}

// DELETE /api/lnaddr/[id] - Delete lightning address
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Call the backend API
    const response = await client.lightningAddress.deleteLightningAddress(id);

    if (response.error) {
      console.error("Backend error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    // Return success message
    return NextResponse.json({
      message: "Lightning address deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lightning address:", error);
    return NextResponse.json(
      { error: "Failed to delete lightning address" },
      { status: 500 },
    );
  }
}
