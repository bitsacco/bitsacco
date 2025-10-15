/**
 * Lightning Address service for web application
 */
import { BaseApiClient } from "./base-client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ApiResponse,
  LightningAddress,
  CreateLightningAddressDto,
  UpdateLightningAddressDto,
  // LightningAddressPaymentRequest, // Not available in core
  // LightningAddressPaymentResponse, // Not available in core
  // LnurlPayResponse, // Not available in core
  // LnurlWithdrawResponse, // Not available in core
} from "@bitsacco/core";

export class LightningAddressService extends BaseApiClient {
  /**
   * Create a new lightning address
   */
  async createAddress(
    request: CreateLightningAddressDto,
  ): Promise<ApiResponse<LightningAddress>> {
    return this.post<LightningAddress>("/lightning-addresses", request);
  }

  /**
   * Get my lightning addresses
   */
  async getMyAddresses(): Promise<ApiResponse<LightningAddress[]>> {
    return this.get<LightningAddress[]>("/lightning-addresses/my");
  }

  /**
   * Get a specific lightning address
   */
  async getAddressById(
    addressId: string,
  ): Promise<ApiResponse<LightningAddress>> {
    return this.get<LightningAddress>(`/lightning-addresses/${addressId}`);
  }

  /**
   * Update lightning address details
   */
  async updateAddress(
    addressId: string,
    request: UpdateLightningAddressDto,
  ): Promise<ApiResponse<LightningAddress>> {
    return this.patch<LightningAddress>(
      `/lightning-addresses/${addressId}`,
      request,
    );
  }

  /**
   * Delete a lightning address
   */
  async deleteAddress(addressId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/lightning-addresses/${addressId}`);
  }

  /**
   * Generate a payment request for a lightning address
   */
  async createPaymentRequest(
    address: string,
    request: any,
  ): Promise<ApiResponse<any>> {
    return this.post<any>(
      `/lightning-addresses/${address}/payment-request`,
      request,
    );
  }

  /**
   * Get LNURL-pay response for a lightning address
   */
  async getLnurlPayInfo(address: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/.well-known/lnurlp/${address}`);
  }

  /**
   * Get LNURL-withdraw response for a lightning address
   */
  async getLnurlWithdrawInfo(address: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/.well-known/lnurlw/${address}`);
  }

  /**
   * Verify a lightning address exists
   */
  async verifyAddress(
    address: string,
  ): Promise<ApiResponse<{ exists: boolean; metadata?: unknown }>> {
    return this.get<{ exists: boolean; metadata?: unknown }>(
      `/lightning-addresses/verify/${address}`,
    );
  }

  /**
   * Get payment history for a lightning address
   */
  async getPaymentHistory(
    addressId: string,
    params?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(
      `/lightning-addresses/${addressId}/payments`,
      params,
    );
  }
}
