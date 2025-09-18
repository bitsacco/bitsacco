import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import AppNavigator from "./navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ThemeProvider from "./components/ThemeProvider";
import PrivacyProvider from "./components/PrivacyProvider";

// Test store initialization

const RenderApp: React.FC = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <PrivacyProvider>
            <AppNavigator />
          </PrivacyProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
};

export default RenderApp;
