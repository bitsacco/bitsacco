import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

const MembershipScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Membership</Text>
        </View>

        {/* Shares Overview */}
        <View style={styles.sharesCard}>
          <Text style={styles.cardTitle}>My Shares</Text>
          <Text style={styles.sharesAmount}>0</Text>
          <Text style={styles.sharesSubtext}>Total shares owned</Text>
        </View>

        {/* Available Offers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Share Offers</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📈</Text>
            <Text style={styles.emptyStateText}>No offers available</Text>
            <Text style={styles.emptyStateSubtext}>
              Check back later for new investment opportunities
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Buy Shares</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Transfer Shares</Text>
          </TouchableOpacity>
        </View>

        {/* Share History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share History</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateText}>No share transactions</Text>
            <Text style={styles.emptyStateSubtext}>
              Your share transactions will appear here
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f1f5f9",
  },
  sharesCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  sharesAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0891b2",
    marginBottom: 4,
  },
  sharesSubtext: {
    fontSize: 14,
    color: "#64748b",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f1f5f9",
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#0891b2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1f5f9",
  },
  emptyState: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#f1f5f9",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
});

export default MembershipScreen;
