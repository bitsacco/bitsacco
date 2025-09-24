import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import { WalletType } from "@bitsacco/core";

// Define simple types inline
interface CreateWalletRequest {
  name: string;
  type: WalletType;
  targetAmount?: number;
  targetDate?: string;
  lockPeriod?: {
    months: number;
  };
}

// GET /api/personal/wallets - List user's wallets
export async function GET() {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call the backend API
    const response = await client.personal.getUserWallets(session.user.id);

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

    // Return backend response directly without transformation
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallets" },
      { status: 500 },
    );
  }
}

// POST /api/personal/wallets - Create new wallet
export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateWalletRequest = await req.json();

    // Validate request body
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 },
      );
    }

    // For TARGET wallets, validate target amount
    if (
      body.type === WalletType.TARGET &&
      (!body.targetAmount || body.targetAmount <= 0)
    ) {
      return NextResponse.json(
        { error: "Target amount is required for target wallets" },
        { status: 400 },
      );
    }

    // For LOCKED wallets, validate lock period
    if (
      body.type === WalletType.LOCKED &&
      (!body.lockPeriod?.months || body.lockPeriod.months <= 0)
    ) {
      return NextResponse.json(
        { error: "Lock period is required for locked wallets" },
        { status: 400 },
      );
    }

    // Transform frontend request to backend format
    const createWalletDto = {
      walletType: body.type as WalletType,
      walletName: body.name,
      ...(body.type === WalletType.TARGET && {
        targetAmountMsats: (body.targetAmount || 0) * 1000, // Convert from sats to msats (1 sat = 1000 msats)
        targetDate: body.targetDate,
      }),
      ...(body.type === WalletType.LOCKED && {
        lockPeriod: body.lockPeriod?.months || 1,
        lockEndDate: new Date(
          Date.now() +
            (body.lockPeriod?.months || 1) * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        autoRenew: false,
        penaltyRate: 2, // Default 2%
      }),
    };

    // Call the backend API
    const response = await client.personal.createWallet(
      session.user.id,
      createWalletDto,
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

    // Return backend response directly without transformation
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json(
      { error: "Failed to create wallet" },
      { status: 500 },
    );
  }
}
