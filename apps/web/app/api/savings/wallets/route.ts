import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { CreateWalletRequest, WalletsResponse } from "@/lib/types/savings";

// GET /api/savings/wallets - List user's wallets
export async function GET() {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, return mock data since backend integration will come later
    // In production, this would proxy to the NestJS backend
    const mockWallets: WalletsResponse = {
      wallets: [
        {
          id: "wallet-1",
          userId: session.user.id,
          walletType: "DEFAULT",
          name: "My Savings",
          balance: 150000, // 150k sats
          balanceFiat: 8775, // 87.75 KES
          isActive: true,
          metadata: {},
          createdAt: new Date("2024-01-15"),
          updatedAt: new Date("2024-09-20"),
        },
        {
          id: "wallet-2",
          userId: session.user.id,
          walletType: "TARGET",
          name: "Emergency Fund",
          balance: 250000, // 250k sats
          balanceFiat: 14625, // 146.25 KES
          isActive: true,
          metadata: {},
          createdAt: new Date("2024-02-01"),
          updatedAt: new Date("2024-09-20"),
          target: {
            targetAmount: 5000000, // 50,000 KES in cents
            targetDate: new Date("2024-12-31"),
            progress: 29.25, // 146.25 / 500 * 100
            autoDeposit: {
              amount: 1000, // 10 KES
              frequency: "weekly" as const,
              isActive: true,
            },
          },
        },
        {
          id: "wallet-3",
          userId: session.user.id,
          walletType: "LOCKED",
          name: "Fixed Deposit",
          balance: 500000, // 500k sats
          balanceFiat: 29250, // 292.50 KES
          isActive: true,
          metadata: {},
          createdAt: new Date("2024-06-01"),
          updatedAt: new Date("2024-09-20"),
          locked: {
            lockStartDate: new Date("2024-06-01"),
            lockEndDate: new Date("2024-12-01"),
            penaltyRate: 2,
            maturityBonusRate: 5,
            isMatured: false,
            canWithdraw: false,
            lockPeriodMonths: 6,
          },
        },
      ],
      totalBalance: 900000, // Total sats
      totalBalanceFiat: 52650, // Total KES in cents
    };

    return NextResponse.json(mockWallets);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallets" },
      { status: 500 },
    );
  }
}

// POST /api/savings/wallets - Create new wallet
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
      body.type === "TARGET" &&
      (!body.targetAmount || body.targetAmount <= 0)
    ) {
      return NextResponse.json(
        { error: "Target amount is required for target wallets" },
        { status: 400 },
      );
    }

    // For LOCKED wallets, validate lock period
    if (
      body.type === "LOCKED" &&
      (!body.lockPeriod?.months || body.lockPeriod.months <= 0)
    ) {
      return NextResponse.json(
        { error: "Lock period is required for locked wallets" },
        { status: 400 },
      );
    }

    // In production, this would create the wallet in the backend
    // For now, return a mock response
    const newWallet = {
      id: `wallet-${Date.now()}`,
      userId: session.user.id,
      walletType: body.type,
      name: body.name,
      balance: 0,
      balanceFiat: 0,
      isActive: true,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(body.type === "TARGET" && {
        target: {
          targetAmount: (body.targetAmount || 0) * 100, // Convert to cents
          targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
          progress: 0,
          autoDeposit: body.autoDeposit
            ? {
                ...body.autoDeposit,
                isActive: true,
              }
            : undefined,
        },
      }),
      ...(body.type === "LOCKED" && {
        locked: {
          lockStartDate: new Date(),
          lockEndDate: new Date(
            Date.now() + body.lockPeriod!.months * 30 * 24 * 60 * 60 * 1000,
          ),
          penaltyRate: 2, // Default 2%
          maturityBonusRate: body.lockPeriod?.maturityBonus || 5,
          isMatured: false,
          canWithdraw: false,
          lockPeriodMonths: body.lockPeriod!.months,
        },
      }),
    };

    return NextResponse.json(newWallet, { status: 201 });
  } catch (error) {
    console.error("Error creating wallet:", error);
    return NextResponse.json(
      { error: "Failed to create wallet" },
      { status: 500 },
    );
  }
}
