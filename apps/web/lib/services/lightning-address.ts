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
  PERSONAL = "personal",
  CHAMA = "chama",
  BUSINESS = "business",
}

export interface LightningAddress {
  _id: string;
  address: string;
  type: AddressType;
  metadata: LightningAddressMetadata;
  settings: LightningAddressSettings;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLightningAddressRequest {
  address?: string;
  type?: AddressType;
  metadata?: LightningAddressMetadata;
  settings?: LightningAddressSettings;
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
  const response = await fetch(`${API_BASE}/lnurl/addresses`, {
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
  const response = await fetch(`${API_BASE}/lnurl/addresses`, {
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
  const response = await fetch(`${API_BASE}/lnurl/addresses/${addressId}`, {
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

export async function validateLightningAddress(
  address: string,
): Promise<ValidateLightningAddressResponse> {
  const response = await fetch(
    `${API_BASE}/lnurl/validate-address?address=${encodeURIComponent(address)}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to validate lightning address");
  }

  return response.json();
}

export const DEFAULT_LIGHTNING_ADDRESS_DESCRIPTION =
  "Send me Bitcoin via Lightning";
export const TOAST_TIMEOUT_MS = 5000;
