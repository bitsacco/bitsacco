import React from "react";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { store } from "./store";
import AppNavigator from "./navigation/AppNavigator";

// Test store initialization

const RenderApp: React.FC = () => {
  return (
    <Provider store={store}>
      <StatusBar style="light" backgroundColor="#0f172a" />
      <AppNavigator />
    </Provider>
  );
};

export default RenderApp;
