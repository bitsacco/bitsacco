/**
 * Base API client for web application
 * Handles HTTP requests with authentication and error handling
 */
import type { ApiResponse, ApiError, ValidationError } from "@bitsacco/core";

export interface ApiClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  getAuthHeader?: () => Promise<Record<string, string> | null>;
}

export class BaseApiClient {
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;
  protected getAuthHeader?: () => Promise<Record<string, string> | null>;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.defaultHeaders,
    };
    this.getAuthHeader = config.getAuthHeader;
  }

  /**
   * Make HTTP request with error handling and authentication
   */
  protected async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    let headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...((options.headers as Record<string, string>) || {}),
    };

    // Add authentication header if available
    if (this.getAuthHeader) {
      const authHeader = await this.getAuthHeader();
      if (authHeader) {
        headers = { ...headers, ...authHeader };
      }
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
