/**
 * Main API client for web application
 * Combines all service modules with authentication
 */
import { AuthService } from "./auth-service";
import { ChamaService } from "./chama-service";
import { WalletService } from "./wallet-service";
import { PersonalService } from "./personal-service";
import { MembershipService } from "./membership-service";
import { LightningAddressService } from "./lightning-address-service";
import { FxService } from "./fx-service";
import type { ApiClientConfig } from "./base-client";

export interface WebApiClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  getAuthHeader?: () => Promise<Record<string, string> | null>;
}

export class WebApiClient {
  public readonly auth: AuthService;
  public readonly chamas: ChamaService;
  public readonly wallets: WalletService;
  public readonly personal: PersonalService;
  public readonly membership: MembershipService;
  public readonly lightningAddresses: LightningAddressService;
  public readonly fx: FxService;

  constructor(config: WebApiClientConfig) {
    const apiConfig: ApiClientConfig = {
      baseUrl: config.baseUrl,
      defaultHeaders: config.defaultHeaders,
      getAuthHeader: config.getAuthHeader,
    };

    this.auth = new AuthService(apiConfig);
    this.chamas = new ChamaService(apiConfig);
    this.wallets = new WalletService(apiConfig);
    this.personal = new PersonalService(apiConfig);
    this.membership = new MembershipService(apiConfig);
    this.lightningAddresses = new LightningAddressService(apiConfig);
    this.fx = new FxService(apiConfig);
  }
}

/**
 * Factory function to create an API client instance
 */
export function createApiClient(config: WebApiClientConfig): WebApiClient {
  return new WebApiClient(config);
}

// Export all service classes for direct use if needed
export { AuthService } from "./auth-service";
export { ChamaService } from "./chama-service";
export { WalletService } from "./wallet-service";
export { PersonalService } from "./personal-service";
export { MembershipService } from "./membership-service";
export { LightningAddressService } from "./lightning-address-service";
export { FxService } from "./fx-service";
export { BaseApiClient } from "./base-client";
