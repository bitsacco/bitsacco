import type { AuthService } from "../auth/auth-service";
import type { ApiError, ApiResponse, ValidationError } from "../types/lib";

export interface ApiClientConfig {
  baseUrl: string;
  authService?: AuthService;
  defaultHeaders?: Record<string, string>;
}

export class BaseApiClient {
  protected baseUrl: string;
  protected authService?: AuthService;
  protected defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.authService = config.authService;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.defaultHeaders,
    };
  }

  /**
   * Set the auth service for this client
   */
  public setAuthService(authService: AuthService): void {
    this.authService = authService;
  }

  /**
   * Make HTTP request with error handling and authentication
   */
  protected async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add authentication header if available
    if (this.authService) {
      const authHeader = await this.authService.getAuthHeader();
      Object.assign(headers, authHeader);
    }

    // Debug: Log the request details
    if (endpoint.includes("shares")) {
      console.log("[BASE-CLIENT] Request details:", {
        url,
        method: options.method || "GET",
        hasAuthHeader: !!headers["Authorization"],
        authHeaderPreview: headers["Authorization"]
          ? `${headers["Authorization"].substring(0, 30)}...`
          : "NO_AUTH_HEADER",
        allHeaders: Object.keys(headers),
      });
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Include cookies for session management
        mode: "cors",
      });

      const contentType = response.headers.get("content-type");
      const isJson = contentType?.includes("application/json");

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let apiError: ApiError | undefined;

        if (isJson) {
          try {
            const errorData = (await response.json()) as {
              message?: string;
              errors?: ValidationError[];
            };
            apiError = {
              statusCode: response.status,
              message: errorData.message || errorMessage,
              errors: errorData.errors,
            };
            errorMessage = apiError.message;
          } catch {
            // Failed to parse error response, use default message
          }
        }

        return {
          error: errorMessage,
          data: undefined,
        };
      }

      // Parse response data
      let data: T | undefined;
      if (isJson) {
        data = (await response.json()) as T;
      } else {
        // For non-JSON responses, return the response text as data
        data = (await response.text()) as unknown as T;
      }

      return {
        data,
        error: undefined,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Network error occurred",
        data: undefined,
      };
    }
  }

  /**
   * GET request
   */
  protected async get<T = unknown>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<ApiResponse<T>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request<T>(url, { method: "GET" });
  }

  /**
   * POST request
   */
  protected async post<T = unknown>(
    endpoint: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  protected async put<T = unknown>(
    endpoint: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  protected async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  protected async delete<T = unknown>(
    endpoint: string,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}
