import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { PaymentProvider } from "@bitsacco/core";

export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const enabled = searchParams.get("enabled");
    const method = searchParams.get("method");

    console.log(
      `[PAYMENT-PROVIDERS] Fetching payment providers for user ${session.user.id}`,
      {
        enabled,
        method,
      },
    );

    // Call the membership client's get payment providers method
    const response = await client.membership.getPaymentProviders();

    let providers = response.data || [];

    // Apply client-side filters if needed
    if (enabled !== null) {
      const isEnabled = enabled === "true";
      providers = providers.filter(
        (provider: PaymentProvider) => provider.enabled === isEnabled,
      );
    }

    if (method) {
      providers = providers.filter(
        (provider: PaymentProvider) => provider.type === method,
      );
    }

    // Sort providers by name for consistent ordering
    providers.sort((a: PaymentProvider, b: PaymentProvider) =>
      a.name.localeCompare(b.name),
    );

    console.log(
      `[PAYMENT-PROVIDERS] Successfully retrieved ${providers.length} payment providers`,
    );

    return NextResponse.json(providers);
  } catch (error) {
    console.error("Failed to retrieve payment providers:", error);
    return NextResponse.json(
      { error: "Failed to retrieve payment providers" },
      { status: 500 },
    );
  }
}
