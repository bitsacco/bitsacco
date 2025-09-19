import { NextResponse } from "next/server";
import type { MembershipTier } from "@bitsacco/core";

// TODO: Implement membership tiers support in the backend API
// This is currently a mock endpoint that returns hardcoded tier definitions
// Once backend support is added, this should fetch from the actual API

// Centralized tier definitions - single source of truth
const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: "member",
    name: "Member",
    level: 1,
    shareRequirements: 1,
    benefits: [
      "Access to member portal",
      "Basic voting rights",
      "Community access",
    ],
  },
  {
    id: "full-member",
    name: "Full Member",
    level: 2,
    shareRequirements: 30,
    benefits: [
      "All Member benefits",
      "Priority customer support",
      "Early access to new features",
      "Enhanced voting power",
    ],
  },
  {
    id: "orange-member",
    name: "Orange Member",
    level: 3,
    shareRequirements: 100,
    benefits: [
      "All Full Member benefits",
      "Exclusive investment opportunities",
      "Quarterly dividend bonuses",
      "VIP event invitations",
    ],
  },
  {
    id: "satoshi-member",
    name: "Satoshi Member",
    level: 5,
    shareRequirements: 500,
    benefits: [
      "All Orange Member benefits",
      "Board meeting observer rights",
      "Direct founder access",
      "Maximum voting influence",
      "Premium dividend rates",
    ],
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      tiers: MEMBERSHIP_TIERS,
    },
  });
}
