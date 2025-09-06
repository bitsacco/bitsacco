import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useAppDispatch, useAppSelector } from "../../../store";
import { initializeApp } from "../store/appSlice";
import { AppController } from "../controllers/AppController";

const LoadingScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.app);

  useEffect(() => {
    const controller = new AppController(dispatch);
    controller.initializeApp();
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Bitsacco</Text>
      <ActivityIndicator size="large" color="#0891b2" style={styles.loader} />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0891b2",
    marginBottom: 32,
  },
  loader: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: "#64748b",
  },
});

export default LoadingScreen;
