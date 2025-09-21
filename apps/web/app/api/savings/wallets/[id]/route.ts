import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

// GET /api/savings/wallets/[id] - Get specific wallet
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

    // In production, this would fetch from the backend
    // For now, return mock data
    const mockWallet = {
      id: walletId,
      userId: session.user.id,
      walletType: "DEFAULT",
      name: "My Savings",
      balance: 150000,
      balanceFiat: 8775,
      isActive: true,
      metadata: {},
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-09-20"),
    };

    return NextResponse.json(mockWallet);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 },
    );
  }
}

// PUT /api/savings/wallets/[id] - Update wallet
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
    const body = await req.json();

    // In production, this would update the wallet in the backend
    const updatedWallet = {
      id: walletId,
      userId: session.user.id,
      ...body,
      updatedAt: new Date(),
    };

    return NextResponse.json(updatedWallet);
  } catch (error) {
    console.error("Error updating wallet:", error);
    return NextResponse.json(
      { error: "Failed to update wallet" },
      { status: 500 },
    );
  }
}

// DELETE /api/savings/wallets/[id] - Delete wallet
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

    // In production, this would delete the wallet from the backend
    // Check if wallet has balance before deleting
    // For now, just return success

    return NextResponse.json({ success: true, walletId });
  } catch (error) {
    console.error("Error deleting wallet:", error);
    return NextResponse.json(
      { error: "Failed to delete wallet" },
      { status: 500 },
    );
  }
}
