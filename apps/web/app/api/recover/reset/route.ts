import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp, newPin } = body;

    if (!phone || !otp || !newPin) {
      return NextResponse.json(
        { message: "Phone, OTP, and new PIN are required" },
        { status: 400 },
      );
    }

    // Call the backend recover endpoint with OTP and new PIN
    // This will verify the OTP and reset the PIN
    const response = await apiClient.auth.recover({
      phone,
      pin: newPin,
      otp,
    });

    // If successful, the backend returns auth tokens
    if (response.data) {
      return NextResponse.json({
        message: "PIN reset successfully",
        success: true,
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
    }

    return NextResponse.json(
      { message: "Failed to reset PIN" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Recovery reset error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Failed to reset PIN" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Failed to reset PIN" },
      { status: 500 },
    );
  }
}
