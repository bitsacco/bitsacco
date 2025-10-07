// Lightning Address types for API client
export enum AddressType {
  PERSONAL = "PERSONAL",
  CHAMA = "CHAMA",
}

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

export interface LightningAddress {
  _id: string;
  address: string;
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

export interface CreateLightningAddressDto {
  address: string;
  type?: AddressType;
  metadata?: Partial<LightningAddressMetadata>;
  settings?: Partial<LightningAddressSettings>;
}

export interface UpdateLightningAddressDto {
  metadata?: Partial<LightningAddressMetadata>;
  settings?: Partial<LightningAddressSettings>;
}

export interface ValidateLightningAddressResponse {
  valid: boolean;
  message?: string;
  metadata?: {
    callback: string;
    minSendable: number;
    maxSendable: number;
    metadata: string;
    tag: string;
  };
}
