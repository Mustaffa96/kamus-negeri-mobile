/**
 * SearchScreen component
 * Allows users to search for dictionary entries (kamus)
 * Provides search input, results display, and navigation to dictionary entry details
 * Handles different states: initial, loading, results, and empty results
 */
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Keyboard
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ScreenNames } from '../navigation/types';
import { Kamus } from '../../domain/entities/Kamus';
import { KamusRepositoryImpl } from '../../data/repositories/KamusRepositoryImpl';
import { NegeriRepositoryImpl } from '../../data/repositories/NegeriRepositoryImpl';
import KamusCard from '../components/KamusCard';

/**
 * Type definition for navigation prop
 * Ensures type safety when using navigation methods
 */
type SearchScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList, 
  ScreenNames.SEARCH
>;

/**
 * Type definition for route prop
 * Ensures type safety when accessing route parameters
 */
type SearchScreenRouteProp = RouteProp<
  RootStackParamList, 
  ScreenNames.SEARCH
>;

/**
 * SearchScreen component
 * Responsible for handling search functionality for dictionary entries
 * Allows users to input search queries and displays matching results
 * Provides navigation to detailed view of dictionary entries
 * @returns React component with search functionality and results display
 */
const SearchScreen: React.FC = () => {
  /**
   * Navigation hook for screen transitions
   * Typed with SearchScreenNavigationProp for type safety
   */
  const navigation = useNavigation<SearchScreenNavigationProp>();
  
  /**
   * Route hook to access navigation parameters
   * May contain initialQuery parameter from other screens
   */
  const route = useRoute<SearchScreenRouteProp>();
  
  /**
   * Extract initialQuery from route parameters if available
   * Used to pre-populate the search field and perform initial search
   */
  const initialQuery = route.params?.initialQuery || '';
  
  /**
   * State variables for managing component data and UI states
   * searchQuery: Current search text input value
   * results: Array of search results to display
   * loading: Indicates if search is in progress
   * searched: Indicates if a search has been performed
   * error: Stores any error messages
   */
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<Kamus[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Repository instance for data access
   * Following dependency injection principle from SOLID
   */
  const kamusRepository = new KamusRepositoryImpl();
  
  /**
   * Perform search with the current query
   * Validates input, updates UI state, and fetches matching dictionary entries
   * Dismisses keyboard after search is initiated
   */
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSearched(true);
      Keyboard.dismiss();
      
      // Search for kamus entries matching the query
      const searchResults = await kamusRepository.searchKamus(searchQuery.trim());
      setResults(searchResults);
    } catch (err) {
      setError('Gagal melakukan carian. Sila cuba lagi.');
      console.error('Error searching kamus:', err);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Clear search results and query
   * Resets the search form and results to initial state
   * Used when user wants to start a new search
   */
  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setSearched(false);
    setError(null);
  };
  
  /**
   * Navigate to kamus detail screen
   * Triggered when user taps on a search result item
   * Passes the kamus object to the detail screen for display
   * @param kamus - The kamus item to show details for
   */
  const handleKamusPress = (kamus: Kamus) => {
    navigation.navigate(ScreenNames.KAMUS_DETAIL, {
      kamusId: kamus.id,
      kamus: kamus,
    });
  };
  
  /**
   * Effect hook to perform initial search if initialQuery is provided
   * Automatically searches when screen is opened with a query parameter
   */
  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar - Input field and search button */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari perkataan..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus={!initialQuery}
        />
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>Cari</Text>
        </TouchableOpacity>
      </View>
      
      {/* Clear Button - Resets search and results */}
      {(searchQuery || results.length > 0) && (
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={handleClear}
        >
          <Text style={styles.clearButtonText}>Kosongkan</Text>
        </TouchableOpacity>
      )}
      
      {/* Loading Indicator - Shows during search operation */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Mencari...</Text>
        </View>
      )}
      
      {/* Error Message - Displays any search errors */}
      {error && (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Search Results - Shows matching dictionary entries */}
      {!loading && searched && (
        <>
          {/* Results Count - Shows number of matches found */}
          <Text style={styles.resultsCount}>
            {results.length} perkataan dijumpai
          </Text>
          
          {/* Results List - Scrollable list of search results */}
          {results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <KamusCard kamus={item} onPress={handleKamusPress} />
              )}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                Tiada perkataan dijumpai untuk "{searchQuery}".
              </Text>
            </View>
          )}
        </>
      )}
      
      {/* Initial State - Instructions shown before search */}
      {!loading && !searched && !error && (
        <View style={styles.centerContainer}>
          <Text style={styles.instructionText}>
            Masukkan perkataan untuk mencari dalam kamus.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

/**
 * Styles for SearchScreen component
 * Defines the visual appearance of all UI elements
 * Includes styles for search bar, buttons, results list, and various state displays
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginBottom: 8,
  },
  clearButtonText: {
    color: '#0066cc',
    fontSize: 14,
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
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 8,
  },
});

export default SearchScreen;
