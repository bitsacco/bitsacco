import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import useTheme from "../../../hooks/useTheme";

interface NoInternetScreenProps {
  onRetry: () => void;
  retryCount?: number;
}

const { width } = Dimensions.get("window");

const NoInternetIcon = ({ size = 80, color = "#64748b" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* WiFi icon with slash */}
    <Path
      d="M12 20h.01M8.5 16.429a5 5 0 0 1 7 0M5 12.859a10 10 0 0 1 5.17-2.69m2.66 0A10 10 0 0 1 19 12.859"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Slash line */}
    <Path
      d="m3 3 18 18"
      stroke="#dc2626"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* WiFi dot */}
    <Circle cx="12" cy="20" r="1" fill={color} />
  </Svg>
);

const NoInternetScreen: React.FC<NoInternetScreenProps> = ({
  onRetry,
  retryCount = 0,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { backgroundColor: colors.surface }]}>
        {/* Icon */}
        <View
          style={[styles.iconContainer, { backgroundColor: colors.border }]}
        >
          <NoInternetIcon size={100} color={colors.textSecondary} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          No Internet Connection
        </Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Please check your network settings and try again. Make sure you have a
          stable internet connection.
        </Text>

        {/* Retry Button */}
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>

        {/* Retry Count */}
        {retryCount > 0 && (
          <Text style={[styles.retryCount, { color: colors.textSecondary }]}>
            Retry attempt: {retryCount}
          </Text>
        )}

        {/* Additional Help Text */}
        <View style={styles.helpContainer}>
          <Text style={[styles.helpTitle, { color: colors.text }]}>
            Troubleshooting Tips:
          </Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            • Check your WiFi or mobile data
          </Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            • Move to an area with better signal
          </Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            • Restart your internet connection
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: width - 40,
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 160,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  retryCount: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 24,
  },
  helpContainer: {
    alignItems: "flex-start",
    width: "100%",
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
});

export default NoInternetScreen;
