import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useAppDispatch } from "../../../store";
import { AppController } from "../controllers/AppController";
import Logo from "../../../../assets/logo.svg";
import useTheme from "../../../hooks/useTheme";

const LoadingScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { colors } = useTheme();

  useEffect(() => {
    const controller = new AppController(dispatch);
    controller.initializeApp();
  }, [dispatch]);

  const anim = useRef(new Animated.Value(1));
  useEffect(() => {
    // makes the sequence loop
    Animated.loop(
      // runs given animations in a sequence
      Animated.sequence([
        // increase size
        Animated.timing(anim.current, {
          toValue: 2,
          duration: 1500,
          useNativeDriver: true,
        }),
        // decrease size
        Animated.timing(anim.current, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={{
          transform: [
            {
              scale: anim.current,
            },
          ],
        }}
      >
        <Logo
          style={styles.logo}
          height={100}
          width={100}
          fill={colors.primary}
        />
      </Animated.View>

      {/* <ActivityIndicator size="large" color={colors.primary} style={styles.loader} /> */}
      {/* <Text style={[styles.text, { color: colors.textSecondary }]}>Loading...</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 32,
    marginBottom: 25,
  },
  loader: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
  },
});

export default LoadingScreen;
