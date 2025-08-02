/**
 * NegeriListScreen component
 * Displays a list of Malaysian states (negeri)
 * Allows users to browse all states and navigate to state details
 * Implements pull-to-refresh for data updates
 */
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  ActivityIndicator, 
  Text,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ScreenNames } from '../navigation/types';
import { Negeri } from '../../domain/entities/Negeri';
import { NegeriRepositoryImpl } from '../../data/repositories/NegeriRepositoryImpl';
import NegeriCard from '../components/NegeriCard';

/**
 * Type definition for navigation prop
 * Ensures type safety when using navigation methods
 */
type NegeriListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList, 
  ScreenNames.NEGERI_LIST
>;

/**
 * NegeriListScreen component
 * Responsible for fetching and displaying the list of Malaysian states
 * Handles loading states, error states, and empty states
 * Provides refresh functionality and navigation to state details
 * @returns React component with list of Malaysian states
 */
const NegeriListScreen: React.FC = () => {
  /**
   * Navigation hook for screen transitions
   * Typed with NegeriListScreenNavigationProp for type safety
   */
  const navigation = useNavigation<NegeriListScreenNavigationProp>();
  
  /**
   * State variables for managing component data and UI states
   * negeriList: Array of state data to display
   * loading: Indicates if data is being fetched initially
   * error: Stores any error messages
   * refreshing: Indicates if data is being refreshed (pull-to-refresh)
   */
  const [negeriList, setNegeriList] = useState<Negeri[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  /**
   * Repository instance for data access
   * Following dependency injection principle from SOLID
   */
  const negeriRepository = new NegeriRepositoryImpl();
  
  /**
   * Fetch negeri data
   * Retrieves the list of all Malaysian states from the repository
   * Updates component state based on the result
   */
  const fetchNegeriData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all states
      const data = await negeriRepository.getAllNegeri();
      setNegeriList(data);
    } catch (err) {
      setError('Gagal memuat data. Sila cuba lagi.');
      console.error('Error fetching negeri data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  /**
   * Handle refresh action
   * Triggered when user pulls down to refresh the list
   * Clears cache and fetches fresh data
   */
  const handleRefresh = () => {
    setRefreshing(true);
    negeriRepository.clearCache(); // Clear cache to get fresh data
    fetchNegeriData();
  };
  
  /**
   * Navigate to negeri detail screen
   * Triggered when user taps on a state card
   * Passes the negeri object to the detail screen for display
   * @param negeri - The negeri item to show details for
   */
  const handleNegeriPress = (negeri: Negeri) => {
    navigation.navigate(ScreenNames.NEGERI_DETAIL, {
      negeriId: negeri.id,
      negeri: negeri,
    });
  };
  
  /**
   * Effect hook to fetch data when component mounts
   * Runs once when the component is first rendered
   */
  useEffect(() => {
    fetchNegeriData();
  }, []);
  
  /**
   * Render loading state with activity indicator
   * Shown during initial data loading (not during refresh)
   */
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }
  
  /**
   * Render error state with error message
   * Shown when data fetching fails
   */
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  /**
   * Render empty state with message
   * Shown when no states are found in the data
   */
  if (negeriList.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          Tiada negeri dijumpai.
        </Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={negeriList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NegeriCard negeri={item} onPress={handleNegeriPress} />
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
 * Styles for NegeriListScreen component
 * Defines the visual appearance of all UI elements
 * Includes styles for container, loading states, error states, and list layout
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    paddingVertical: 8,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default NegeriListScreen;
