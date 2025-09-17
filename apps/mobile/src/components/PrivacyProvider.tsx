import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { AppState, AppStateStatus } from "react-native";
import { useAppDispatch, useAppSelector } from "../store";
import { setPrivacyScreen } from "../features/app/store/appSlice";
import PrivacyScreen from "./PrivacyScreen";

interface PrivacyProviderProps {
  children: React.ReactNode;
}

const PrivacyProvider: React.FC<PrivacyProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const showPrivacyScreen = useAppSelector(
    (state) => state.app.showPrivacyScreen
  );

  useEffect(() => {
    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log("App state changed to:", nextAppState);

      // Platform-specific handling
      if (Platform.OS === "ios") {
        // iOS: Show privacy screen on background and inactive states
        if (nextAppState === "background" || nextAppState === "inactive") {
          dispatch(setPrivacyScreen(true));
        } else if (nextAppState === "active") {
          dispatch(setPrivacyScreen(false));
        }
      } else {
        // Android: Show privacy screen primarily on background
        // Android 'inactive' can be triggered by notifications, so we're more conservative
        if (nextAppState === "background") {
          dispatch(setPrivacyScreen(true));
        } else if (nextAppState === "active") {
          dispatch(setPrivacyScreen(false));
        }
      }
    };

    // Add listener
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Cleanup function
    return () => {
      subscription?.remove();
    };
  }, [dispatch]);

  // If privacy screen should be shown, render it on top
  if (showPrivacyScreen) {
    return (
      <View style={styles.container}>
        {children}
        <View style={styles.privacyOverlay}>
          <PrivacyScreen />
        </View>
      </View>
    );
  }

  // Normal app rendering
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  privacyOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999, // Android
  },
});

export default PrivacyProvider;
