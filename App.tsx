/**
 * App.tsx
 * Main entry point for the Kamus Negeri Mobile application
 * Implements the root navigation container and theme provider
 */
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

// Import our main navigator component
import AppNavigator from './src/presentation/navigation/AppNavigator';

/**
 * App component
 * Root component that wraps the entire application with necessary providers
 * @returns React component
 */
export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

