/**
 * NegeriDetailScreen component
 * Displays detailed information about a Malaysian state (negeri)
 * Shows state name, capital, flag, emblem, description, and related dictionary entries
 * Allows navigation to dictionary entries specific to this state
 */
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ScreenNames } from '../navigation/types';
import { Negeri } from '../../domain/entities/Negeri';
import { NegeriRepositoryImpl } from '../../data/repositories/NegeriRepositoryImpl';
import { KamusRepositoryImpl } from '../../data/repositories/KamusRepositoryImpl';
import { Kamus } from '../../domain/entities/Kamus';

/**
 * Type definition for navigation prop
 * Ensures type safety when using navigation methods
 */
type NegeriDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList, 
  ScreenNames.NEGERI_DETAIL
>;

/**
 * Type definition for route prop
 * Ensures type safety when accessing route parameters
 */
type NegeriDetailScreenRouteProp = RouteProp<
  RootStackParamList, 
  ScreenNames.NEGERI_DETAIL
>;

/**
 * NegeriDetailScreen component
 * Responsible for fetching and displaying detailed information about a Malaysian state
 * Also fetches and displays related dictionary entries from this state
 * Handles loading states, error states, and displays the negeri data in a structured format
 * @returns React component with detailed view of a state
 */
const NegeriDetailScreen: React.FC = () => {
  /**
   * Navigation hook for screen transitions
   * Typed with NegeriDetailScreenNavigationProp for type safety
   */
  const navigation = useNavigation<NegeriDetailScreenNavigationProp>();
  
  /**
   * Route hook to access navigation parameters
   * Contains negeriId and potentially the negeri object itself
   */
  const route = useRoute<NegeriDetailScreenRouteProp>();
  
  /**
   * State variables for managing component data and UI states
   * negeri: The state data to display
   * kamusList: List of dictionary entries associated with this state
   * loading: Indicates if negeri data is being fetched
   * loadingKamus: Indicates if kamus data is being fetched
   * error: Stores any error messages
   */
  const [negeri, setNegeri] = useState<Negeri | null>(route.params.negeri || null);
  const [kamusList, setKamusList] = useState<Kamus[]>([]);
  const [loading, setLoading] = useState(!route.params.negeri);
  const [loadingKamus, setLoadingKamus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Extract negeriId from route parameters
   * Used to fetch negeri data if not provided directly
   */
  const { negeriId } = route.params;
  
  /**
   * Repository instances for data access
   * Following dependency injection principle from SOLID
   */
  const negeriRepository = new NegeriRepositoryImpl();
  const kamusRepository = new KamusRepositoryImpl();
  
  /**
   * Fetch negeri data
   * Retrieves the state details from the repository
   * Handles loading states and error conditions
   */
  const fetchNegeriData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If negeri is not provided in route params, fetch it
      if (!negeri) {
        const fetchedNegeri = await negeriRepository.getNegeriById(negeriId);
        
        if (!fetchedNegeri) {
          setError('Negeri tidak dijumpai.');
          setLoading(false);
          return;
        }
        
        setNegeri(fetchedNegeri);
      }
    } catch (err) {
      setError('Gagal memuat data negeri. Sila cuba lagi.');
      console.error('Error fetching negeri data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Fetch kamus entries for this negeri
   * Retrieves dictionary entries specific to this state
   * Used to display a preview of entries in the state detail screen
   */
  const fetchKamusData = async () => {
    try {
      setLoadingKamus(true);
      
      // Fetch kamus entries for this negeri
      const fetchedKamus = await kamusRepository.getKamusByNegeriId(negeriId);
      setKamusList(fetchedKamus);
    } catch (err) {
      console.error('Error fetching kamus data for negeri:', err);
    } finally {
      setLoadingKamus(false);
    }
  };
  
  /**
   * Navigate to kamus list screen for this negeri
   * Triggered when user taps on "View All" button
   * Shows all dictionary entries for this specific state
   */
  const handleViewAllKamus = () => {
    if (negeri) {
      navigation.navigate(ScreenNames.KAMUS_LIST, {
        negeriId: negeri.id,
        title: `Kamus ${negeri.name}`,
      });
    }
  };
  
  /**
   * Navigate to kamus detail screen
   * Triggered when user taps on a dictionary entry
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
   * Effect hook to fetch negeri data when component mounts
   * Depends on negeriId to refetch if the ID changes
   */
  useEffect(() => {
    fetchNegeriData();
  }, [negeriId]);
  
  /**
   * Effect hook to fetch kamus data once negeri is loaded
   * Only runs when negeri data is available
   */
  useEffect(() => {
    if (negeri) {
      fetchKamusData();
    }
  }, [negeri]);
  
  /**
   * Render loading state with activity indicator
   * Shown while negeri data is being fetched
   */
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }
  
  /**
   * Render error state with error message
   * Shown when data fetching fails or negeri is not found
   */
  if (error || !negeri) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Negeri tidak dijumpai.'}</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with State Name - Shows state name and capital */}
        <View style={styles.header}>
          <Text style={styles.stateName}>{negeri.name}</Text>
          {negeri.capital && (
            <Text style={styles.capital}>Ibu Negeri: {negeri.capital}</Text>
          )}
        </View>
        
        {/* Images Section - Displays flag and emblem of the state */}
        <View style={styles.imagesSection}>
          <View style={styles.imageContainer}>
            {negeri.flag ? (
              <Image 
                source={{ uri: negeri.flag }} 
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.image, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>Tiada Bendera</Text>
              </View>
            )}
            <Text style={styles.imageLabel}>Bendera</Text>
          </View>
          
          <View style={styles.imageContainer}>
            {negeri.emblem ? (
              <Image 
                source={{ uri: negeri.emblem }} 
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.image, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>Tiada Jata</Text>
              </View>
            )}
            <Text style={styles.imageLabel}>Jata</Text>
          </View>
        </View>
        
        {/* Description Section - Shows detailed information about the state */}
        {negeri.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Keterangan</Text>
            <Text style={styles.description}>{negeri.description}</Text>
          </View>
        )}
        
        {/* Kamus Section - Preview of dictionary entries from this state */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Perkataan</Text>
            <TouchableOpacity onPress={handleViewAllKamus}>
              <Text style={styles.viewAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          
          {loadingKamus ? (
            <ActivityIndicator size="small" color="#0066cc" />
          ) : kamusList.length === 0 ? (
            <Text style={styles.emptyText}>
              Tiada perkataan untuk negeri ini.
            </Text>
          ) : (
            kamusList.slice(0, 5).map((kamus) => (
              <TouchableOpacity
                key={kamus.id}
                style={styles.kamusItem}
                onPress={() => handleKamusPress(kamus)}
              >
                <Text style={styles.kamusWord}>{kamus.word}</Text>
                <Text style={styles.kamusMeaning} numberOfLines={1}>
                  {kamus.meaning}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Styles for NegeriDetailScreen component
 * Defines the visual appearance of all UI elements
 * Organized by component section (header, images, description, kamus items)
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
  scrollContent: {
    padding: 16,
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
  },
  stateName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 8,
    textAlign: 'center',
  },
  capital: {
    fontSize: 16,
    color: '#666',
  },
  imagesSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageContainer: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: '100%',
    height: 120,
    marginBottom: 8,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  imageLabel: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#0066cc',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  kamusItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  kamusWord: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  kamusMeaning: {
    fontSize: 14,
    color: '#666',
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
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default NegeriDetailScreen;
