import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

// Import main screens
import HomeScreen from "../features/home/views/HomeScreen";
import WalletScreen from "../features/wallet/views/WalletScreen";
import MembershipScreen from "../features/membership/views/MembershipScreen";
import ProfileScreen from "../features/profile/views/ProfileScreen";

export type MainTabParamList = {
  Home: undefined;
  Wallet: undefined;
  Membership: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Simple tab bar icon component
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <Text style={{ color: focused ? "#0891b2" : "#64748b", fontSize: 12 }}>
    {name}
  </Text>
);

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      id={"main-tabs" as any}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1e293b",
          borderTopColor: "#334155",
        },
        tabBarActiveTintColor: "#0891b2",
        tabBarInactiveTintColor: "#64748b",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen as any}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen as any}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="💳" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Membership"
        component={MembershipScreen as any}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="👥" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen as any}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
