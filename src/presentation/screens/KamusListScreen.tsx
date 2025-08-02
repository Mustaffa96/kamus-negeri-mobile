/**
 * KamusListScreen component
 * Displays a list of dictionary entries (kamus)
 * 
 * This screen is responsible for displaying dictionary entries from the Kamus Negeri API
 * It can display all entries or filter by negeriId if provided in route params
 * Includes loading, error, and empty states with retry functionality
 */
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  ActivityIndicator, 
  Text,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ScreenNames } from '../navigation/types';
import { Kamus } from '../../domain/entities/Kamus';
import { KamusRepositoryImpl } from '../../data/repositories/KamusRepositoryImpl';
import KamusCard from '../components/KamusCard';
import { ApiClient } from '../../data/datasources/ApiClient';
import { API_ENDPOINTS } from '../../core/constants/api';

/**
 * Type for navigation prop
 * Provides type safety for navigation actions
 */
type KamusListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList, 
  ScreenNames.KAMUS_LIST
>;

/**
 * Type for route prop
 * Provides type safety for route parameters
 */
type KamusListScreenRouteProp = RouteProp<
  RootStackParamList, 
  ScreenNames.KAMUS_LIST
>;

/**
 * KamusListScreen component
 * Main component for displaying dictionary entries
 * @returns React component
 */
const KamusListScreen: React.FC = () => {
  // Navigation and route hooks for type-safe navigation
  const navigation = useNavigation<KamusListScreenNavigationProp>();
  const route = useRoute<KamusListScreenRouteProp>();
  
  // State variables to manage component state
  const [kamusList, setKamusList] = useState<Kamus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Get negeriId from route params for filtering
  const { negeriId } = route.params || {};
  
  // Create repository instance for data access
  const kamusRepository = new KamusRepositoryImpl();
  
    /**
   * Debug API connection and data fetching
   * This helps identify issues with API connectivity or data format
   * @returns Promise that resolves when debug is complete
   */
  const debugApiConnection = async (): Promise<void> => {
    console.log('=== DEBUG: Starting API connection test ===');
    try {
      // Get API client instance
      const apiClient = ApiClient.getInstance();
      console.log('DEBUG: API base URL:', apiClient.getBaseUrl());
      
      // Test direct API connection
      console.log('DEBUG: Testing direct API connection to /kamus endpoint...');
      const debugResult = await apiClient.debugApiEndpoint(API_ENDPOINTS.KAMUS);
      
      if (debugResult.success) {
        console.log('DEBUG: API connection successful!');
        console.log(`DEBUG: Received ${Array.isArray(debugResult.data) ? debugResult.data.length : 0} items`);
      } else {
        console.error('DEBUG: API connection failed:', debugResult.error);
      }
    } catch (err: any) {
      console.error('DEBUG: Error during API debug:', err);
    }
    console.log('=== DEBUG: API connection test complete ===');
  };
  
    /**
   * Fetch kamus data based on negeriId
   * Retrieves dictionary entries from the repository and updates state
   * @returns Promise that resolves when data fetching is complete
   */
  const fetchKamusData = async (): Promise<void> => {
    try {
      // Log the start of the fetch operation with negeriId info
      console.log(`DEBUG: Starting fetchKamusData, negeriId: ${negeriId || 'none (all kamus)'}`);
      
      setLoading(true);
      setError(null);
      let data: Kamus[];
      
      // Fetch data based on whether negeriId is provided
      if (negeriId) {
        console.log('DEBUG: Fetching kamus by negeriId:', negeriId);
        data = await kamusRepository.getKamusByNegeriId(negeriId);
      } else {
        console.log('DEBUG: Fetching all kamus entries');
        data = await kamusRepository.getAllKamus();
      }
      
      // Log the number of items received
      console.log(`DEBUG: Received ${data.length} kamus items`);
      
      // Log a sample of the data for debugging
      if (data.length > 0) {
        console.log('DEBUG: Sample data:', JSON.stringify(data[0]));
        // Check if the data has the expected structure
        const firstItem = data[0];
        console.log('DEBUG: Data structure check - id:', firstItem.id);
      }
      
      // Ensure we're setting state with valid data
      if (Array.isArray(data)) {
        setKamusList(data);
      } else {
        console.error('DEBUG: Data is not an array, cannot set state');
        setError('Format data tidak sah. Sila cuba lagi.');
      }
    } catch (err: any) {
      console.error('DEBUG: Error in fetchKamusData:', err);
      setError('Gagal memuat data. Sila cuba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('DEBUG: fetchKamusData completed, loading state set to false');
    }
  };

    /**
   * Handle refresh action
   * Clears cache and fetches fresh data
   */
  const handleRefresh = (): void => {
    setRefreshing(true);
    kamusRepository.clearCache(); // Clear cache to get fresh data
    fetchKamusData();
  };

    /**
   * Navigate to kamus detail screen when a dictionary entry is pressed
   * @param kamus - The kamus item to show details for
   */
  const handleKamusPress = (kamus: Kamus): void => {
    navigation.navigate(ScreenNames.KAMUS_DETAIL, {
      kamusId: kamus.id,
      kamus: kamus,
    });
  };
  
  // Fetch data on component mount or when negeriId changes
  useEffect(() => {
    // Run debug function first to check API connectivity
    debugApiConnection().then(() => {
      console.log('DEBUG: Now fetching kamus data after API check');
      fetchKamusData();
    }).catch((err: any) => {
      console.error('DEBUG: Error during API debug:', err);
      // Still try to fetch data even if debug fails
      fetchKamusData();
    });
  }, [negeriId]); // Re-run effect when negeriId changes

  // Debug render state to help with troubleshooting
  console.log('DEBUG: Render state - loading:', loading, 'refreshing:', refreshing, 'error:', error, 'kamusList length:', kamusList.length);

  // Render loading state when data is being fetched
  if (loading && !refreshing) {
    console.log('DEBUG: Rendering loading state');
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  // Render error state when data fetching fails
  if (error) {
    console.log('DEBUG: Rendering error state:', error);
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRefresh}
        >
          <Text style={styles.retryButtonText}>Cuba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render empty state when no data is available
  if (!kamusList || kamusList.length === 0) {
    console.log('DEBUG: Rendering empty state');
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          Tiada perkataan dijumpai.
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRefresh}
        >
          <Text style={styles.retryButtonText}>Cuba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render the main content - a list of dictionary entries
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={kamusList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <KamusCard kamus={item} onPress={handleKamusPress} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#0066cc']}
          />
        }
      />
    </SafeAreaView>
  );

};

/**
 * Styles for KamusListScreen component
 * Defines the visual appearance of the screen and its elements
 */
const styles = StyleSheet.create({
  // Main container for the screen
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // Container for centered content (loading, error, empty states)
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Style for the FlatList content
  listContent: {
    paddingVertical: 8,
  },
  // Style for loading text
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  // Style for error message
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Style for empty state message
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Style for retry button
  retryButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  // Style for retry button text
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default KamusListScreen;
