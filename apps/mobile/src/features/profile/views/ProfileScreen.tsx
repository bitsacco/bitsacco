import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../../store";
import { AuthController } from "../../auth/controllers/AuthController";

const ProfileScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const authController = new AuthController(dispatch);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => authController.logout(),
      },
    ]);
  };

  const menuItems = [
    { title: "Account Settings", icon: "⚙️", action: () => {} },
    { title: "Security", icon: "🔒", action: () => {} },
    { title: "Notifications", icon: "🔔", action: () => {} },
    { title: "Help & Support", icon: "❓", action: () => {} },
    { title: "About", icon: "ℹ️", action: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.firstName?.[0] || "U"}</Text>
          </View>
          <Text style={styles.userName}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : "User"}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email || "user@example.com"}
          </Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.1</Text>
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
  userCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0891b2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#f1f5f9",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#f1f5f9",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#64748b",
  },
  menuSection: {
    marginBottom: 32,
  },
  menuItem: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    color: "#f1f5f9",
  },
  menuChevron: {
    fontSize: 18,
    color: "#64748b",
  },
  logoutButton: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#f1f5f9",
  },
  versionInfo: {
    alignItems: "center",
  },
  versionText: {
    fontSize: 12,
    color: "#64748b",
  },
});

export default ProfileScreen;
