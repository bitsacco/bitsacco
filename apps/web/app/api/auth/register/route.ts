import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await apiClient.auth.register(body);

    // Ensure the response data is properly serializable
    if (!response.data) {
      return NextResponse.json(
        { message: "Invalid response from server" },
        { status: 500 },
      );
    }

    // Extract only the serializable parts
    const { user, accessToken, refreshToken } = response.data;

    // Create a clean, serializable response
    const serializedResponse = {
      user: user
        ? {
            id: user.id,
            phone: user.phone,
            profile: user.profile,
            roles: user.roles,
          }
        : null,
      accessToken,
      refreshToken,
    };

    return NextResponse.json(serializedResponse);
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
