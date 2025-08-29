import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { message: "Phone number is required" },
        { status: 400 },
      );
    }

    // Call the backend recover endpoint without OTP to request OTP
    // The backend expects a dummy PIN for the initial request
    const response = await apiClient.auth.recover({
      phone,
      pin: "000000", // Dummy PIN required by backend for OTP request
    });

    // The backend will send OTP and return a response
    // indicating OTP was sent
    if (response.data) {
      return NextResponse.json({
        message: "Recovery code sent successfully",
        success: true,
      });
    }

    return NextResponse.json(
      { message: "Failed to send recovery code" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Recovery request error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Failed to process recovery request" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Failed to process recovery request" },
      { status: 500 },
    );
  }
}
