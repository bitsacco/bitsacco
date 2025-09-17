import React, { useEffect } from "react";
import { View, StatusBar, StyleSheet } from "react-native";
import { useAppDispatch } from "../store";
import { loadThemeFromStorage } from "../features/app/store/appSlice";
import useTheme from "../hooks/useTheme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { colors, themeLoaded } = useTheme();

  useEffect(() => {
    // Load theme from storage immediately on mount
    dispatch(loadThemeFromStorage());
  }, [dispatch]);

  // Show a minimal loading state with the correct background while theme loads
  // This prevents the flash by keeping a consistent dark background initially
  if (!themeLoaded) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: "#0f172a" }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        {/* You can add a loading spinner here if needed */}
      </View>
    );
  }

  // Once theme is loaded, render children with proper theme
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.text === "#ffffff" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
});

export default ThemeProvider;
