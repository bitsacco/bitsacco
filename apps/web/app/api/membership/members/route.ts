import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    // TODO: Implement real user search API integration
    // This endpoint needs to be connected to the actual user/member database
    // Requirements:
    // - Search members by name, email, phone number
    // - Exclude current user from results
    // - Validate member eligibility for share transfers
    // - Return paginated results for large datasets
    // - Handle privacy settings (some users may not want to be searchable)
    // - Include member verification status
    // - Consider rate limiting for search queries

    // MOCK DATA - Replace with real API call to backend
    const members = [
      {
        id: "member-1",
        name: "John Doe",
        email: "john.doe@example.com",
        phoneNumber: "+254712345678",
      },
      {
        id: "member-2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phoneNumber: "+254723456789",
      },
      {
        id: "member-3",
        name: "Bob Johnson",
        email: "bob.j@example.com",
        phoneNumber: "+254734567890",
      },
    ].filter(
      (member) =>
        member.id !== session.user?.id &&
        (member.name.toLowerCase().includes(search.toLowerCase()) ||
          member.email.toLowerCase().includes(search.toLowerCase()) ||
          member.phoneNumber.includes(search)),
    );

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 },
    );
  }
}
