import "react-native-gesture-handler";
import React from "react";
import { View, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme as NavigationDarkTheme,
  createNavigationContainerRef,
} from "@react-navigation/native";

import { store } from "./src/store";
import RootNavigator from "./src/navigation/RootNavigator";

import { CommonAlertProvider } from "./src/components/CommonAlertModal/commonAlertModal";

import { CommonLoaderProvider } from "./src/components/CommonLoader/commonLoader";

import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";

import {
  requestUserPermission,
  notificationListener,
} from "./src/services/notificationService";

export const navigationRef = createNavigationContainerRef<any>();

const AppContent = () => {
  const { isDarkMode, colors } = useTheme();

  React.useEffect(() => {
    requestUserPermission();
    notificationListener();
  }, []);

  // Navigation theme
  const navigationTheme = isDarkMode
    ? {
        ...NavigationDarkTheme,
        colors: {
          ...NavigationDarkTheme.colors,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
        },
      };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* Global Status Bar */}
      <StatusBar
        // backgroundColor={colors.background}

        barStyle={isDarkMode ? "light-content" : "dark-content"}
        // translucent={false}
      />

      {/* Global Alert */}
      <CommonAlertProvider>
        {/* Global Loader */}
        <CommonLoaderProvider>
          {/* Navigation */}
          <NavigationContainer ref={navigationRef} theme={navigationTheme}>
            <RootNavigator />
          </NavigationContainer>
        </CommonLoaderProvider>
      </CommonAlertProvider>
    </View>
  );
};

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        {/* Theme Provider */}
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
