import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { NavigationContainer, DefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { CommonAlertProvider } from './src/components/CommonAlertModal/commonAlertModal';
import { CommonLoaderProvider } from './src/components/CommonLoader/commonLoader';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

const AppContent = () => {
  const { isDarkMode, colors } = useTheme();

  const navigationTheme = isDarkMode ? {
    ...NavigationDarkTheme,
    colors: { ...NavigationDarkTheme.colors, background: colors.background, card: colors.card, text: colors.text, border: colors.border }
  } : {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: colors.background, card: colors.card, text: colors.text, border: colors.border }
  };

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <CommonAlertProvider>
        <CommonLoaderProvider>
          <NavigationContainer theme={navigationTheme}>
            <RootNavigator />
          </NavigationContainer>
        </CommonLoaderProvider>
      </CommonAlertProvider>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}

export default App;
