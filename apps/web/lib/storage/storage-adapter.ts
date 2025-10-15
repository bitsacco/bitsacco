/**
 * Storage adapter interface and implementations for web application
 * Provides platform-specific storage operations
 */

/**
 * Abstract storage adapter interface for platform-agnostic storage operations
 */
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Web storage adapter using localStorage and sessionStorage
 */
export class WebStorageAdapter implements StorageAdapter {
  private storage: Storage;

  constructor(type: "local" | "session" = "local") {
    if (typeof window === "undefined") {
      throw new Error(
        "WebStorageAdapter can only be used in browser environment",
      );
    }
    this.storage = type === "local" ? localStorage : sessionStorage;
  }

  async getItem(key: string): Promise<string | null> {
    return Promise.resolve(this.storage.getItem(key));
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.setItem(key, value);
    return Promise.resolve();
  }

  async removeItem(key: string): Promise<void> {
    this.storage.removeItem(key);
    return Promise.resolve();
  }

  async clear(): Promise<void> {
    this.storage.clear();
    return Promise.resolve();
  }
}

/**
 * Server-side no-op storage adapter
 * Used for server-side rendering where browser storage is not available
 */
export class ServerStorageAdapter implements StorageAdapter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getItem(_key: string): Promise<string | null> {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setItem(_key: string, _value: string): Promise<void> {
    // No-op for server-side
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async removeItem(_key: string): Promise<void> {
    // No-op for server-side
  }

  async clear(): Promise<void> {
    // No-op for server-side
  }
}

/**
 * Create a storage adapter based on the environment
 */
export function createStorageAdapter(
  type: "local" | "session" = "local",
): StorageAdapter {
  if (typeof window !== "undefined") {
    return new WebStorageAdapter(type);
  } else {
    return new ServerStorageAdapter();
  }
}
