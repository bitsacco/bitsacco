import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import useTheme from "../hooks/useTheme";
import Logo from "../../assets/logo.svg";

const { width, height } = Dimensions.get("window");

const PrivacyScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background overlay for extra privacy */}
      <View
        style={[
          styles.backgroundOverlay,
          { backgroundColor: colors.background },
        ]}
      />

      {/* Logo Only */}
      <View style={styles.logoContainer}>
        <Logo height={120} width={120} fill={colors.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 1, // Full opacity for complete privacy
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});

export default PrivacyScreen;
