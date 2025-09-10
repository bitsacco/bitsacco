// Mobile app specific auth types - adapts the core types for UI convenience

// Utility functions to convert between mobile types and core types
import type { User } from "@bitsacco/core/types";

export interface MobileUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roles: string[];
}

export interface MobileLoginRequest {
  email: string;
  password: string;
}

export interface MobileRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: {
    number: string;
    countryCode: string;
  };
}


export const adaptCoreUserToMobile = (coreUser: User): MobileUser => {
  return {
    id: coreUser.id,
    firstName: coreUser.profile?.name?.split(" ")[0],
    lastName: coreUser.profile?.name?.split(" ").slice(1).join(" "),
    email: coreUser.phone?.number || "user@example.com", // Temporary fallback
    phone: coreUser.phone?.number,
    roles: coreUser.roles.map(String),
  };
};

export const adaptMobileUserToCore = (mobileUser: MobileUser): User => {
  return {
    id: mobileUser.id,
    profile: {
      name: mobileUser.firstName && mobileUser.lastName 
        ? `${mobileUser.firstName} ${mobileUser.lastName}` 
        : undefined,
    },
    phone: mobileUser.phone ? {
      number: mobileUser.phone,
      verified: false,
    } : undefined,

    roles: mobileUser.roles.map(Number),
  };
};
