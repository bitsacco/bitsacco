import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await apiClient.auth.verify(body);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Verification error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Verification failed" },
      { status: 500 },
    );
  }
}
