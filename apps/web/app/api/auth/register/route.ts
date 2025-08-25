import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await apiClient.auth.register(body);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Registration failed" },
      { status: 500 },
    );
  }
}
