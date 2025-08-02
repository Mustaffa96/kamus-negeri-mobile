/**
 * AppNavigator component
 * Sets up the navigation structure for the application using React Navigation
 * Defines all screens and their navigation options
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList, ScreenNames } from './types';

// Import all screen components
import HomeScreen from '../screens/HomeScreen';
import KamusListScreen from '../screens/KamusListScreen';
import KamusDetailScreen from '../screens/KamusDetailScreen';
import NegeriListScreen from '../screens/NegeriListScreen';
import NegeriDetailScreen from '../screens/NegeriDetailScreen';
import SearchScreen from '../screens/SearchScreen';

// Create the stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * AppNavigator component
 * Sets up the navigation stack with all application screens
 * Configures common header styling and screen-specific options
 * @returns React component with navigation stack
 */
const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
        initialRouteName={ScreenNames.HOME}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#0066cc',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          animation: 'slide_from_right',
        }}
      >
        {/* Home Screen - Main entry point of the app */}
        <Stack.Screen 
          name={ScreenNames.HOME} 
          component={HomeScreen} 
          options={{ title: 'Kamus Negeri' }} 
        />
        
        {/* Kamus List Screen - Shows list of dictionary entries */}
        <Stack.Screen 
          name={ScreenNames.KAMUS_LIST} 
          component={KamusListScreen} 
          options={({ route }) => ({ title: route.params?.title || 'Kamus' })} 
        />
        
        {/* Kamus Detail Screen - Shows detailed information about a dictionary entry */}
        <Stack.Screen 
          name={ScreenNames.KAMUS_DETAIL} 
          component={KamusDetailScreen} 
          options={{ title: 'Perkataan' }} 
        />
        
        {/* Negeri List Screen - Shows list of Malaysian states */}
        <Stack.Screen 
          name={ScreenNames.NEGERI_LIST} 
          component={NegeriListScreen} 
          options={{ title: 'Negeri-negeri' }} 
        />
        
        {/* Negeri Detail Screen - Shows detailed information about a Malaysian state */}
        <Stack.Screen 
          name={ScreenNames.NEGERI_DETAIL} 
          component={NegeriDetailScreen} 
          options={({ route }) => ({ title: route.params?.negeri?.name || 'Negeri' })} 
        />
        
        {/* Search Screen - Allows searching for dictionary entries */}
        <Stack.Screen 
          name={ScreenNames.SEARCH} 
          component={SearchScreen} 
          options={{ title: 'Cari' }} 
        />
      </Stack.Navigator>
  );
};

export default AppNavigator;
