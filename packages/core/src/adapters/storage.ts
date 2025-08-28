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
 * Secure storage adapter for React Native (stub implementation)
 * This will be implemented when the React Native app is created
 */
export class SecureStorageAdapter implements StorageAdapter {
  async getItem(_key: string): Promise<string | null> {
    return Promise.reject(
      new Error("SecureStorageAdapter not implemented yet"),
    );
  }

  async setItem(_key: string, _value: string): Promise<void> {
    return Promise.reject(
      new Error("SecureStorageAdapter not implemented yet"),
    );
  }

  async removeItem(_key: string): Promise<void> {
    return Promise.reject(
      new Error("SecureStorageAdapter not implemented yet"),
    );
  }

  async clear(): Promise<void> {
    return Promise.reject(
      new Error("SecureStorageAdapter not implemented yet"),
    );
  }
}
