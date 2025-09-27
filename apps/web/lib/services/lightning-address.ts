// Re-export types from core package
export type {
  LightningAddress,
  CreateLightningAddressDto as CreateLightningAddressRequest,
  UpdateLightningAddressDto as UpdateLightningAddressRequest,
  LightningAddressMetadata,
  LightningAddressSettings,
  ValidateLightningAddressResponse,
} from "@bitsacco/core";
export { AddressType } from "@bitsacco/core";

// Import the types for use in function signatures
import type {
  LightningAddress,
  CreateLightningAddressDto as CreateLightningAddressRequest,
  UpdateLightningAddressDto as UpdateLightningAddressRequest,
  ValidateLightningAddressResponse,
} from "@bitsacco/core";

// Service functions that make API calls to our Next.js routes
export async function getUserLightningAddresses(): Promise<LightningAddress[]> {
  try {
    const response = await fetch("/api/lnaddr/my-addresses", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch lightning addresses");
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch lightning addresses:", error);
    throw error;
  }
}

export async function createLightningAddress(
  data: CreateLightningAddressRequest,
): Promise<LightningAddress> {
  try {
    const response = await fetch("/api/lnaddr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create lightning address");
    }

    return response.json();
  } catch (error) {
    console.error("Failed to create lightning address:", error);
    throw error;
  }
}

export async function updateLightningAddress(
  addressId: string,
  data: UpdateLightningAddressRequest,
): Promise<LightningAddress> {
  try {
    const response = await fetch(`/api/lnaddr/${addressId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update lightning address");
    }

    return response.json();
  } catch (error) {
    console.error("Failed to update lightning address:", error);
    throw error;
  }
}

// Validate lightning address using well-known endpoint
// This function makes a direct external request, not through our API
export async function validateLightningAddress(
  address: string,
): Promise<ValidateLightningAddressResponse> {
  try {
    const [username, domain] = address.split("@");
    if (!username || !domain) {
      return {
        valid: false,
        message: "Invalid lightning address format",
      };
    }

    const response = await fetch(
      `https://${domain}/.well-known/lnurlp/${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return {
        valid: false,
        message:
          response.status === 404
            ? "Lightning address not found"
            : "Failed to reach lightning address server",
      };
    }

    const metadata = await response.json();
    if (metadata && metadata.tag === "payRequest") {
      return { valid: true, metadata };
    } else {
      return {
        valid: false,
        message: "Invalid LNURL-pay response",
      };
    }
  } catch {
    return {
      valid: false,
      message: "Failed to validate lightning address",
    };
  }
}

export const DEFAULT_LIGHTNING_ADDRESS_DESCRIPTION =
  "Send me Bitcoin via Lightning";
export const TOAST_TIMEOUT_MS = 5000;
