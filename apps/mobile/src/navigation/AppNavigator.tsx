import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppSelector } from "../store";

// Import screen components
import LoadingScreen from "../features/app/views/LoadingScreen";
import WebViewScreen from "../features/webview/views/WebviewScreen";
import MainNavigator from "./MainNavigator";

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
        id={"root-stack" as any}
        screenOptions={{
          headerShown: false,
        }}
      >
        {isLoading || !isInitialized ? (
          <Stack.Screen name="Loading" component={LoadingScreen as any} />
        ) : isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator as any} />
        ) : (
          <Stack.Screen name="Web" component={WebViewScreen as any} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
export default AppNavigator;
