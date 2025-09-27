import { BaseApiClient } from "./base-client";
import type {
  ApiResponse,
  LightningAddress,
  CreateLightningAddressDto,
  UpdateLightningAddressDto,
  ValidateLightningAddressResponse,
} from "../types";

/**
 * Lightning Address API client
 * Handles all lightning address operations
 */
export class LightningAddressApiClient extends BaseApiClient {
  /**
   * Get user's lightning addresses
   */
  async getUserLightningAddresses(): Promise<ApiResponse<LightningAddress[]>> {
    return this.get<LightningAddress[]>("/lnaddr/my-addresses");
  }

  /**
   * Create a new lightning address
   */
  async createLightningAddress(
    data: CreateLightningAddressDto,
  ): Promise<ApiResponse<LightningAddress>> {
    return this.post<LightningAddress>("/lnaddr", data);
  }

  /**
   * Update lightning address settings
   */
  async updateLightningAddress(
    addressId: string,
    data: UpdateLightningAddressDto,
  ): Promise<ApiResponse<LightningAddress>> {
    return this.patch<LightningAddress>(`/lnaddr/${addressId}`, data);
  }

  /**
   * Get a specific lightning address
   */
  async getLightningAddress(
    addressId: string,
  ): Promise<ApiResponse<LightningAddress>> {
    return this.get<LightningAddress>(`/lnaddr/${addressId}`);
  }

  /**
   * Delete a lightning address
   */
  async deleteLightningAddress(
    addressId: string,
  ): Promise<ApiResponse<{ message: string }>> {
    return this.delete<{ message: string }>(`/lnaddr/${addressId}`);
  }

  /**
   * Validate lightning address using well-known endpoint
   * This makes a direct request to the lightning address domain
   */
  async validateLightningAddress(
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

      const metadata = (await response.json()) as {
        tag?: string;
        callback?: string;
        minSendable?: number;
        maxSendable?: number;
        metadata?: string;
      };
      if (metadata && metadata.tag === "payRequest") {
        return {
          valid: true,
          metadata: {
            callback: metadata.callback || "",
            minSendable: metadata.minSendable || 0,
            maxSendable: metadata.maxSendable || 0,
            metadata: metadata.metadata || "",
            tag: metadata.tag,
          },
        };
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
}
