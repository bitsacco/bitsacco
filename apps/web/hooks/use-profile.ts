"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { User as CoreUser, UpdateUserRequest } from "@bitsacco/core/types";
import { apiClient } from "../lib/auth";

export interface ProfileData {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface LightningAddressData {
  address: string;
  verified: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  transactions: boolean;
  chamaUpdates: boolean;
  marketPlace: boolean;
  emailNotifications: boolean;
}

export interface DisplayPreferences {
  currency: "sats" | "btc" | "usd";
  theme: "light" | "dark" | "system";
  language: "en" | "sw";
}

export interface UseProfileReturn {
  // Profile data
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  lightningAddress: LightningAddressData | null;

  // Preferences
  notifications: NotificationPreferences;
  setNotifications: React.Dispatch<
    React.SetStateAction<NotificationPreferences>
  >;
  displaySettings: DisplayPreferences;
  setDisplaySettings: React.Dispatch<React.SetStateAction<DisplayPreferences>>;

  // Actions
  updateProfile: () => Promise<boolean>;
  changePinCode: (currentPin: string, newPin: string) => Promise<boolean>;
  generateLightningAddress: () => Promise<boolean>;
  savePreferences: () => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<boolean>;

  // State
  loading: boolean;
  error: string | null;
  success: string | null;

  // Utils
  clearMessages: () => void;
}

export function useProfile(): UseProfileReturn {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile data state
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    avatarUrl: undefined,
  });

  const [lightningAddress, setLightningAddress] =
    useState<LightningAddressData | null>(null);

  // Preferences state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    transactions: true,
    chamaUpdates: true,
    marketPlace: false,
    emailNotifications: false,
  });

  const [displaySettings, setDisplaySettings] = useState<DisplayPreferences>({
    currency: "sats",
    theme: "light",
    language: "en",
  });

  // Initialize data from session
  useEffect(() => {
    if (session?.user) {
      const user = session.user as CoreUser;
      setProfileData({
        name: user.profile?.name || "",
        email: "", // TODO: Add email to user profile
        avatarUrl: user.profile?.avatarUrl,
      });

      // Generate a lightning address based on user ID (temporary solution)
      setLightningAddress({
        address: `${user.id.slice(0, 12).toLowerCase()}@bitsacco.com`,
        verified: true,
        createdAt: new Date().toISOString(),
      });

      // TODO: Load user preferences from API
      // For now, use defaults or localStorage
      const savedNotifications = localStorage.getItem("user-notifications");
      const savedDisplaySettings = localStorage.getItem(
        "user-display-settings",
      );

      if (savedNotifications) {
        try {
          setNotifications(JSON.parse(savedNotifications));
        } catch {
          // Keep defaults
        }
      }

      if (savedDisplaySettings) {
        try {
          setDisplaySettings(JSON.parse(savedDisplaySettings));
        } catch {
          // Keep defaults
        }
      }
    }
  }, [session]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const updateProfile = useCallback(async (): Promise<boolean> => {
    if (!session?.user) {
      setError("No user session found");
      return false;
    }

    setLoading(true);
    clearMessages();

    try {
      const user = session.user as CoreUser;
      const updateRequest: UpdateUserRequest = {
        userId: user.id,
        updates: {
          profile: {
            name: profileData.name,
            avatarUrl: profileData.avatarUrl,
          },
          phone: user.phone,
          nostr: user.nostr,
          roles: user.roles,
        },
      };

      const response = await apiClient.auth.updateUser(updateRequest);

      if (response.data && !response.error) {
        // Update the session with new user data
        await update({
          ...session,
          user: {
            ...user,
            profile: response.data.profile,
          },
        });

        setSuccess("Profile updated successfully!");
        return true;
      } else {
        setError(response.error || "Failed to update profile");
        return false;
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setError("Failed to update profile. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [session, profileData, update, clearMessages]);

  const changePinCode = useCallback(
    async (currentPin: string, newPin: string): Promise<boolean> => {
      if (newPin.length !== 4) {
        setError("PIN must be 4 digits");
        return false;
      }

      setLoading(true);
      clearMessages();

      try {
        // TODO: Implement PIN change API call when available
        // const response = await apiClient.auth.changePin({
        //   currentPin,
        //   newPin,
        // });

        // Simulate API call for now
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSuccess("PIN changed successfully!");
        return true;
      } catch (error) {
        console.error("PIN change error:", error);
        setError("Failed to change PIN. Please check your current PIN.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [clearMessages],
  );

  const generateLightningAddress = useCallback(async (): Promise<boolean> => {
    if (!session?.user) {
      setError("No user session found");
      return false;
    }

    setLoading(true);
    clearMessages();

    try {
      const user = session.user as CoreUser;
      // TODO: Implement lightning address generation API call
      const newAddress = `${user.id.slice(0, 12).toLowerCase()}@bitsacco.com`;

      setLightningAddress({
        address: newAddress,
        verified: true,
        createdAt: new Date().toISOString(),
      });

      setSuccess("Lightning address generated successfully!");
      return true;
    } catch (error) {
      console.error("Lightning address generation error:", error);
      setError("Failed to generate lightning address. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [session, clearMessages]);

  const savePreferences = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    clearMessages();

    try {
      // TODO: Implement preferences API call when available
      // await apiClient.auth.updatePreferences({
      //   notifications,
      //   displaySettings,
      // });

      // Save to localStorage for now
      localStorage.setItem("user-notifications", JSON.stringify(notifications));
      localStorage.setItem(
        "user-display-settings",
        JSON.stringify(displaySettings),
      );

      setSuccess("Preferences saved successfully!");
      return true;
    } catch (error) {
      console.error("Preferences save error:", error);
      setError("Failed to save preferences. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [notifications, displaySettings, clearMessages]);

  const uploadAvatar = useCallback(
    async (file: File): Promise<boolean> => {
      if (!session?.user) {
        setError("No user session found");
        return false;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return false;
      }

      if (file.size > 1024 * 1024) {
        setError("File size must be less than 1MB");
        return false;
      }

      setLoading(true);
      clearMessages();

      try {
        // TODO: Implement avatar upload API call
        // const formData = new FormData();
        // formData.append('avatar', file);
        // const response = await apiClient.auth.uploadAvatar(formData);

        // For now, create a temporary URL
        const avatarUrl = URL.createObjectURL(file);

        setProfileData((prev) => ({
          ...prev,
          avatarUrl,
        }));

        setSuccess("Avatar uploaded successfully!");
        return true;
      } catch (error) {
        console.error("Avatar upload error:", error);
        setError("Failed to upload avatar. Please try again.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [session, clearMessages],
  );

  return {
    // Profile data
    profileData,
    setProfileData,
    lightningAddress,

    // Preferences
    notifications,
    setNotifications,
    displaySettings,
    setDisplaySettings,

    // Actions
    updateProfile,
    changePinCode,
    generateLightningAddress,
    savePreferences,
    uploadAvatar,

    // State
    loading,
    error,
    success,

    // Utils
    clearMessages,
  };
}
