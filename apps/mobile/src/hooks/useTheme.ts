import { useAppSelector } from "../store";
import { colors } from "../constants/theme";

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export const useTheme = () => {
  const currentTheme = useAppSelector((state) => state.app.theme);
  const themeLoaded = useAppSelector((state) => state.app.themeLoaded);

  const darkTheme: ThemeColors = {
    background: "#1A202C", // Custom dark background
    surface: colors.neutral[800], // #1e293b
    text: colors.neutral[0], // #ffffff
    textSecondary: colors.neutral[400], // #94a3b8
    border: colors.neutral[700], // #334155
    primary: colors.primary[500], // #14b8a6
    error: colors.semantic.error, // #dc2626
    success: colors.semantic.success, // #16a34a
    warning: colors.semantic.warning, // #d97706
    info: colors.semantic.info, // #2563eb
  };

  const lightTheme: ThemeColors = {
    background: colors.neutral[0], // #ffffff
    surface: colors.neutral[50], // #f8fafc
    text: colors.neutral[800], // #1e293b (close to #1A202C)
    textSecondary: colors.neutral[600], // #475569
    border: colors.neutral[200], // #e2e8f0
    primary: colors.primary[500], // #14b8a6
    error: colors.semantic.error, // #dc2626
    success: colors.semantic.success, // #16a34a
    warning: colors.semantic.warning, // #d97706
    info: colors.semantic.info, // #2563eb
  };

  return {
    theme: currentTheme,
    themeLoaded,
    colors: currentTheme === "dark" ? darkTheme : lightTheme,
    isDark: currentTheme === "dark",
    isLight: currentTheme === "light",
  };
};

export default useTheme;
