export interface LightningAddressMetadata {
  description: string;
  minSendable: number;
  maxSendable: number;
  commentAllowed: number;
}

export interface LightningAddressSettings {
  enabled: boolean;
  allowComments: boolean;
  notifyOnPayment: boolean;
}

export enum AddressType {
  PERSONAL = "PERSONAL",
  CHAMA = "CHAMA",
}

export interface LightningAddress {
  _id: string;
  address: string;
  domain?: string;
  type: AddressType;
  metadata: LightningAddressMetadata;
  settings: LightningAddressSettings;
  ownerId: string;
  stats?: {
    totalReceived: number;
    paymentCount: number;
    lastPaymentAt?: Date;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateLightningAddressRequest {
  address: string;
  type?: AddressType;
  metadata?: Partial<LightningAddressMetadata>;
  settings?: Partial<LightningAddressSettings>;
}

export interface UpdateLightningAddressRequest {
  metadata?: Partial<LightningAddressMetadata>;
  settings?: Partial<LightningAddressSettings>;
}

export interface ValidateLightningAddressResponse {
  valid: boolean;
  message?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function getUserLightningAddresses(): Promise<LightningAddress[]> {
  const response = await fetch(`${API_BASE}/lnaddr/my-addresses`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch lightning addresses");
  }

  return response.json();
}

export async function createLightningAddress(
  data: CreateLightningAddressRequest,
): Promise<LightningAddress> {
  const response = await fetch(`${API_BASE}/lnaddr`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create lightning address");
  }

  return response.json();
}

export async function updateLightningAddress(
  addressId: string,
  data: UpdateLightningAddressRequest,
): Promise<LightningAddress> {
  const response = await fetch(`${API_BASE}/lnaddr/${addressId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update lightning address");
  }

  return response.json();
}

// Validate lightning address using well-known endpoint
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
      return { valid: true };
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
