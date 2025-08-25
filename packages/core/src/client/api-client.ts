import { AuthApiClient } from "./auth-client";
import { ChamaApiClient } from "./chama-client";
import { MembershipApiClient } from "./membership-client";
import { WalletApiClient } from "./wallet-client";
import { type AuthService } from "../auth/auth-service";

export interface ApiClientConfig {
  baseUrl: string;
  authService?: AuthService;
  defaultHeaders?: Record<string, string>;
}

/**
 * Main API client that combines all service-specific clients
 */
export class ApiClient {
  public auth: AuthApiClient;
  public chamas: ChamaApiClient;
  public membership: MembershipApiClient;
  public wallet: WalletApiClient;

  constructor(config: ApiClientConfig) {
    // Initialize all service clients with the same configuration
    this.auth = new AuthApiClient(config);
    this.chamas = new ChamaApiClient(config);
    this.membership = new MembershipApiClient(config);
    this.wallet = new WalletApiClient(config);
  }

  /**
   * Update the auth service for all clients
   * Useful when auth service is initialized after the API client
   */
  setAuthService(authService: AuthService): void {
    this.auth.setAuthService(authService);
    this.chamas.setAuthService(authService);
    this.membership.setAuthService(authService);
    this.wallet.setAuthService(authService);
  }
}
