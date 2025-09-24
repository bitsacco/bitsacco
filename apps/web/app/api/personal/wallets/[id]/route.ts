import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

// GET /api/personal/wallets/[id] - Get specific wallet
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: walletId } = await params;

    // Call the backend API
    const response = await client.personal.getWallet(session.user.id, walletId);

    if (response.error) {
      console.error("Backend error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    if (!response.data) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Return backend response directly without transformation
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 },
    );
  }
}

// PUT /api/personal/wallets/[id] - Update wallet
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: walletId } = await params;
    const updateData = await req.json();

    // Call the backend API
    const response = await client.personal.updateWallet(
      session.user.id,
      walletId,
      updateData,
    );

    if (response.error) {
      console.error("Backend error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    if (!response.data) {
      return NextResponse.json(
        { error: "Failed to update wallet" },
        { status: 500 },
      );
    }

    // Return backend response directly without transformation
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error updating wallet:", error);
    return NextResponse.json(
      { error: "Failed to update wallet" },
      { status: 500 },
    );
  }
}

// DELETE /api/personal/wallets/[id] - Delete wallet
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: walletId } = await params;

    // Call the backend API
    const response = await client.personal.deleteWallet(
      session.user.id,
      walletId,
    );

    if (response.error) {
      console.error("Backend error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    // Return 204 No Content for successful deletion
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting wallet:", error);
    return NextResponse.json(
      { error: "Failed to delete wallet" },
      { status: 500 },
    );
  }
}
