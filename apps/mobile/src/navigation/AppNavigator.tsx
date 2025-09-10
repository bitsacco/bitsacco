import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppSelector } from "../store";

// Import screen components
import LoadingScreen from "../features/app/views/LoadingScreen";
import WebViewScreen from "../features/webview/views/WebviewScreen";

export type RootStackParamList = {
  Loading: undefined;
  Auth: undefined;
  Main: undefined;
  Web: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isInitialized, isLoading } = useAppSelector((state) => state.app);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isLoading || !isInitialized ? (
          <Stack.Screen name="Loading" component={LoadingScreen} />
        ) : isAuthenticated ? (
          <Stack.Screen name="Main" component={LoadingScreen} />
        ) : (
          <Stack.Screen name="Web" component={WebViewScreen} />
          // <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigator;
