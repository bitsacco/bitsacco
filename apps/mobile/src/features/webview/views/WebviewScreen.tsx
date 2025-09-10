// screens/WebViewScreen.tsx
import React, { useEffect, useRef, useCallback } from "react";
import { WebView } from "react-native-webview";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../../../store";
import NetInfo from "@react-native-community/netinfo";
import {
  setConnected,
  setError,
  clearError,
  incrementRetryCount,
  resetRetryCount,
  setWebViewScrolled,
  setNavigationState,
  startLoading,
  finishLoading,
  startRefresh,
} from "../store/WebViewSlice";

const WebViewScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const webViewRef = useRef<WebView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // Get state from Redux store
  const {
    isLoading,
    isConnected,
    refreshing,
    hasError,
    errorDetails,
    errorCode,
    retryCount,
    isWebViewScrolled,
    currentUrl,
  } = useAppSelector((state) => state.webview);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(setConnected(state.isConnected ?? false));

      // If connection theres connection and error, try reload
      if (state.isConnected && hasError) {
        handleRetry();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [hasError, dispatch, handleRetry]);

  const onRefresh = () => {
    dispatch(startRefresh());
    dispatch(clearError());
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleRetry = useCallback(() => {
    dispatch(clearError());
    dispatch(incrementRetryCount());
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, [dispatch]);

  const onWebViewMessage = (event: any) => {
    const msgData = event.nativeEvent.data;

    // Try to parse scroll position messages
    try {
      const data = JSON.parse(msgData);
      if (data.type === "scroll") {
        dispatch(setWebViewScrolled(!data.isAtTop));
      }
    } catch {
      // Handle other messages or parsing errors
      console.log("WebView message:", msgData);
    }
  };

  const handleLoadStart = () => {
    dispatch(startLoading());
  };

  const handleLoadEnd = () => {
    dispatch(finishLoading());
    dispatch(resetRetryCount());
  };

  const handleNavigationStateChange = (navState: any) => {
    dispatch(
      setNavigationState({
        url: navState.url,
        canGoBack: navState.canGoBack,
        canGoForward: navState.canGoForward,
      })
    );
  };

  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.warn("Webview error: ", nativeEvent);

    // Set user-friendly error message based on error type
    let errorMessage = "Something went wrong while loading the page.";

    if (nativeEvent.code === -1009 || nativeEvent.code === -1001) {
      errorMessage =
        "No internet connection. Please check your network and try again.";
    } else if (nativeEvent.code === -1003) {
      errorMessage = "Server not found. Please try again later.";
    } else if (nativeEvent.code === -1001) {
      errorMessage = "Connection timeout. Please try again.";
    } else if (nativeEvent.description) {
      errorMessage = nativeEvent.description;
    }

    dispatch(
      setError({
        hasError: true,
        errorDetails: errorMessage,
        errorCode: nativeEvent.code,
      })
    );
  };

  // JavaScript to inject for scroll detection
  const injectedJavaScript = `
    (function() {
      let lastScrollTop = 0;
      
      function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const isAtTop = scrollTop === 0;
        
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'scroll',
          scrollTop: scrollTop,
          isAtTop: isAtTop
        }));
        
        lastScrollTop = scrollTop;
      }
      
      window.addEventListener('scroll', handleScroll);
      document.addEventListener('scroll', handleScroll);
      
      // Initial check
      setTimeout(handleScroll, 100);
    })();
    true;
  `;

  // Error Screen Component
  const ErrorScreen = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorContent}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorMessage}>{errorDetails}</Text>

        {!isConnected && (
          <Text style={styles.noInternetText}>No Internet Connection</Text>
        )}

        {errorCode && (
          <Text style={styles.errorCode}>Error Code: {errorCode}</Text>
        )}

        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>

        <Text style={styles.retryCount}>
          {retryCount > 0 && `Retry attempt: ${retryCount}`}
        </Text>
      </View>
    </View>
  );

  // Show error screen if there's an error
  if (hasError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#0f172a" }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <ErrorScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#1A202C" }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {!isConnected && (
        <View
          style={[
            styles.noInternetBanner,
            { paddingTop: insets.top > 0 ? 0 : 8 },
          ]}
        >
          <Text style={styles.noInternetBannerText}>
            No Internet connection. Please Reload screen
          </Text>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        scrollEnabled={!isWebViewScrolled}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FFFFFF"]}
            tintColor={"#FFFFFF"}
            title="Pull to refresh"
            titleColor={"#FFFFFF"}
            progressBackgroundColor={
              Platform.OS === "android" ? "#1e293b" : undefined
            }
          />
        }
      >
        <WebView
          ref={webViewRef}
          style={styles.webViewContainer}
          source={{ uri: currentUrl }}
          startInLoadingState
          renderLoading={() =>
            isLoading ? (
              <View style={[StyleSheet.absoluteFill, styles.loader]}>
                <ActivityIndicator
                  animating={true}
                  size={"large"}
                  color="#FFFFFF"
                />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : (
              <View />
            )
          }
          onMessage={onWebViewMessage}
          onLoadEnd={handleLoadEnd}
          onLoadStart={handleLoadStart}
          onError={handleError}
          onNavigationStateChange={handleNavigationStateChange}
          injectedJavaScript={injectedJavaScript}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsBackForwardNavigationGestures={Platform.OS === "ios"}
          bounces={false}
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={true}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            if (nativeEvent.statusCode >= 400) {
              handleError(syntheticEvent);
            }
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles remain the same as before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A202C",
  },
  scrollContainer: {
    flex: 1,
  },
  loader: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A202C",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 10,
    fontSize: 16,
  },
  webViewContainer: {
    backgroundColor: "#1A202C",
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  noInternetBanner: {
    backgroundColor: "#dc2626",
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  noInternetBannerText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    paddingHorizontal: 20,
  },
  errorContent: {
    backgroundColor: "#1e293b",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  noInternetText: {
    fontSize: 14,
    color: "#dc2626",
    fontWeight: "bold",
    marginBottom: 20,
  },
  errorCode: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 20,
    fontStyle: "italic",
  },
  retryButton: {
    backgroundColor: "#0891b2",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  retryCount: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
  },
});

export default WebViewScreen;
