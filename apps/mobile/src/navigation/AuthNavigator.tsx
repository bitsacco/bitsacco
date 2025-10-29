import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import auth screens
import LoginScreen from "../features/auth/views/LoginScreen";
import RegisterScreen from "../features/auth/views/RegisterScreen";
import WebViewScreen from "../features/webview/views/WebviewScreen";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  Webview: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      id={"auth-stack" as any}
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen as any} />
      <Stack.Screen name="Register" component={RegisterScreen as any} />
      <Stack.Screen name="Webview" component={WebViewScreen as any} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
