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
  setThemeDetected,
} from "../store/WebViewSlice";
import { setTheme } from "../../app/store/appSlice";
import NoInternetScreen from "../components/NoInternetScreen";
import useTheme from "../../../hooks/useTheme";

const WebViewScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const webViewRef = useRef<WebView>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Get state from Redux store
  const {
    isLoading,
    isConnected,
    refreshing,
    hasError,
    errorDetails,
    errorCode,
    isNetworkError,
    retryCount,
    isWebViewScrolled,
    currentUrl,
    webViewLoaded,
    themeDetected,
  } = useAppSelector((state) => state.webview);

  const handleRetry = useCallback(() => {
    dispatch(clearError());
    dispatch(incrementRetryCount());
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(setConnected(state.isConnected ?? false));

      // If connection is restored and there was an error, try reload
      if (state.isConnected && hasError) {
        handleRetry();
      }

      // If connection is lost, show network error
      if (!state.isConnected && !hasError) {
        dispatch(
          setError({
            hasError: true,
            errorDetails:
              "No internet connection. Please check your network and try again.",
            errorCode: -1009,
            isNetworkError: true,
          })
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [hasError, dispatch, handleRetry]);

  const onRefresh = () => {
    dispatch(startRefresh());
    dispatch(clearError());
    dispatch(setThemeDetected(false)); // Reset theme detection on refresh
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const onWebViewMessage = (event: any) => {
    const msgData = event.nativeEvent.data;

    // Try to parse messages from webview
    try {
      const data = JSON.parse(msgData);

      if (data.type === "scroll") {
        dispatch(setWebViewScrolled(!data.isAtTop));
      } else if (data.type === "theme") {
        // Only update theme if webview has loaded and we haven't detected theme yet
        // This prevents the flash on initial load
        if (webViewLoaded && !themeDetected) {
          console.log(
            "WebView theme detected (first time):",
            data.theme,
            data.details
          );
          dispatch(setTheme(data.theme));
          dispatch(setThemeDetected(true));
        } else if (webViewLoaded && themeDetected) {
          // Allow subsequent theme changes from user interaction within webview
          console.log("WebView theme changed:", data.theme, data.details);
          dispatch(setTheme(data.theme));
        }
        // Ignore theme detection during initial webview load to prevent flash
      }
    } catch {
      // Handle other messages or parsing errors
      console.log("WebView message:", msgData);
    }
  };

  const handleLoadStart = () => {
    dispatch(startLoading());
    // Reset theme detection for new page loads
    dispatch(setThemeDetected(false));
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
    let isNetworkError = false;

    // Check for network-related errors
    if (
      nativeEvent.code === -1009 ||
      nativeEvent.code === -1001 ||
      nativeEvent.code === -1003 ||
      nativeEvent.code === -1100 ||
      nativeEvent.code === -1004
    ) {
      isNetworkError = true;
      errorMessage =
        "No internet connection. Please check your network and try again.";
    } else if (nativeEvent.code === -1003) {
      isNetworkError = true;
      errorMessage = "Server not found. Please try again later.";
    } else if (nativeEvent.code === -1001) {
      isNetworkError = true;
      errorMessage = "Connection timeout. Please try again.";
    } else if (nativeEvent.description) {
      errorMessage = nativeEvent.description;
    }

    dispatch(
      setError({
        hasError: true,
        errorDetails: errorMessage,
        errorCode: nativeEvent.code,
        isNetworkError,
      })
    );
  };

  // JavaScript to inject for scroll detection and theme detection
  const injectedJavaScript = `
    (function() {
      let lastScrollTop = 0;
      let lastTheme = null;

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

      function detectTheme() {
        // Check for common theme indicators
        const body = document.body;
        const html = document.documentElement;

        // Method 1: Check data attributes
        const bodyTheme = body.getAttribute('data-theme') ||
                         body.getAttribute('data-color-scheme') ||
                         body.getAttribute('data-mode');

        const htmlTheme = html.getAttribute('data-theme') ||
                         html.getAttribute('data-color-scheme') ||
                         html.getAttribute('data-mode');

        // Method 2: Check CSS classes
        const isDarkClass = body.classList.contains('dark') ||
                           body.classList.contains('dark-mode') ||
                           body.classList.contains('theme-dark') ||
                           html.classList.contains('dark') ||
                           html.classList.contains('dark-mode') ||
                           html.classList.contains('theme-dark');

        const isLightClass = body.classList.contains('light') ||
                            body.classList.contains('light-mode') ||
                            body.classList.contains('theme-light') ||
                            html.classList.contains('light') ||
                            html.classList.contains('light-mode') ||
                            html.classList.contains('theme-light');

        // Method 3: Check computed styles
        const bodyBg = window.getComputedStyle(body).backgroundColor;
        const htmlBg = window.getComputedStyle(html).backgroundColor;

        // Method 4: Check CSS custom properties
        const rootTheme = window.getComputedStyle(html).getPropertyValue('--theme-mode') ||
                         window.getComputedStyle(html).getPropertyValue('--color-scheme');

        // Determine theme
        let detectedTheme = 'dark'; // default

        if (bodyTheme === 'light' || htmlTheme === 'light' || isLightClass || rootTheme === 'light') {
          detectedTheme = 'light';
        } else if (bodyTheme === 'dark' || htmlTheme === 'dark' || isDarkClass || rootTheme === 'dark') {
          detectedTheme = 'dark';
        } else {
          // Fallback: analyze background color
          const bgColor = bodyBg !== 'rgba(0, 0, 0, 0)' ? bodyBg : htmlBg;
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            // Extract RGB values and calculate luminance
            const rgb = bgColor.match(/\\d+/g);
            if (rgb && rgb.length >= 3) {
              const r = parseInt(rgb[0]);
              const g = parseInt(rgb[1]);
              const b = parseInt(rgb[2]);
              const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              detectedTheme = luminance > 0.5 ? 'light' : 'dark';
            }
          }
        }

        // Send theme update if changed
        if (detectedTheme !== lastTheme) {
          lastTheme = detectedTheme;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'theme',
            theme: detectedTheme,
            details: {
              bodyTheme,
              htmlTheme,
              isDarkClass,
              isLightClass,
              bodyBg,
              htmlBg,
              rootTheme
            }
          }));
        }
      }

      // Set up scroll detection
      window.addEventListener('scroll', handleScroll);
      document.addEventListener('scroll', handleScroll);

      // Set up theme detection
      detectTheme();

      // Watch for theme changes
      if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
          let shouldCheckTheme = false;
          mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' &&
                (mutation.attributeName === 'class' ||
                 mutation.attributeName === 'data-theme' ||
                 mutation.attributeName === 'data-color-scheme' ||
                 mutation.attributeName === 'data-mode')) {
              shouldCheckTheme = true;
            }
          });
          if (shouldCheckTheme) {
            setTimeout(detectTheme, 100);
          }
        });

        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class', 'data-theme', 'data-color-scheme', 'data-mode']
        });

        observer.observe(document.body, {
          attributes: true,
          attributeFilter: ['class', 'data-theme', 'data-color-scheme', 'data-mode']
        });
      }

      // Initial checks - delay theme detection to prevent flash
      setTimeout(function() {
        handleScroll();
      }, 100);

      // Delayed initial theme detection (after page has more time to load)
      setTimeout(function() {
        detectTheme();
      }, 1000);

      // Re-check theme periodically (less frequent to avoid unnecessary updates)
      setInterval(detectTheme, 10000);
    })();
    true;
  `;

  // Error Screen Component
  const ErrorScreen = () => (
    <View
      style={[styles.errorContainer, { backgroundColor: colors.background }]}
    >
      <View style={[styles.errorContent, { backgroundColor: colors.surface }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.errorTitle, { color: colors.text }]}>
          Connection Error
        </Text>
        <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>
          {errorDetails}
        </Text>

        {!isConnected && (
          <Text style={[styles.noInternetText, { color: colors.error }]}>
            No Internet Connection
          </Text>
        )}

        {errorCode && (
          <Text style={[styles.errorCode, { color: colors.textSecondary }]}>
            Error Code: {errorCode}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={handleRetry}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>

        <Text style={[styles.retryCount, { color: colors.textSecondary }]}>
          {retryCount > 0 && `Retry attempt: ${retryCount}`}
        </Text>
      </View>
    </View>
  );

  // Show appropriate error screen based on error type
  if (hasError) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {isNetworkError || !isConnected ? (
          <NoInternetScreen onRetry={handleRetry} retryCount={retryCount} />
        ) : (
          <ErrorScreen />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {!isConnected && (
        <View
          style={[
            styles.noInternetBanner,
            {
              paddingTop: insets.top > 0 ? 0 : 8,
              backgroundColor: colors.error,
            },
          ]}
        >
          <Text style={[styles.noInternetBannerText, { color: "#ffffff" }]}>
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
            colors={[colors.text]}
            tintColor={colors.text}
            title="Pull to refresh"
            titleColor={colors.text}
            progressBackgroundColor={
              Platform.OS === "android" ? colors.surface : undefined
            }
          />
        }
      >
        <WebView
          ref={webViewRef}
          style={[
            styles.webViewContainer,
            { backgroundColor: colors.background },
          ]}
          source={{ uri: currentUrl }}
          startInLoadingState
          renderLoading={() =>
            isLoading ? (
              <View
                style={[
                  StyleSheet.absoluteFill,
                  styles.loader,
                  { backgroundColor: colors.background },
                ]}
              >
                <ActivityIndicator
                  animating={true}
                  size={"large"}
                  color={colors.text}
                />
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  Loading...
                </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  loader: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  webViewContainer: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  noInternetBanner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  noInternetBannerText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorContent: {
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
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  noInternetText: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 20,
  },
  errorCode: {
    fontSize: 12,
    marginBottom: 20,
    fontStyle: "italic",
  },
  retryButton: {
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
    fontStyle: "italic",
  },
});

export default WebViewScreen;
