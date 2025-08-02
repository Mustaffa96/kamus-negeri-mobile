/**
 * KamusDetailScreen component
 * Displays detailed information about a dictionary entry (kamus)
 * Shows word, meaning, example usage, notes, and associated state (negeri)
 * Allows navigation to the associated state's detail screen
 */
import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ScreenNames } from '../navigation/types';
import { Kamus } from '../../domain/entities/Kamus';
import { KamusRepositoryImpl } from '../../data/repositories/KamusRepositoryImpl';
import { NegeriRepositoryImpl } from '../../data/repositories/NegeriRepositoryImpl';
import { Negeri } from '../../domain/entities/Negeri';

/**
 * Type definition for navigation prop
 * Ensures type safety when using navigation methods
 */
type KamusDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList, 
  ScreenNames.KAMUS_DETAIL
>;

/**
 * Type definition for route prop
 * Ensures type safety when accessing route parameters
 */
type KamusDetailScreenRouteProp = RouteProp<
  RootStackParamList, 
  ScreenNames.KAMUS_DETAIL
>;

/**
 * KamusDetailScreen component
 * Responsible for fetching and displaying detailed information about a dictionary entry
 * Handles loading states, error states, and displays the kamus data in a structured format
 * @returns React component with detailed view of a kamus entry
 */
const KamusDetailScreen: React.FC = () => {
  /**
   * Navigation hook for screen transitions
   * Typed with KamusDetailScreenNavigationProp for type safety
   */
  const navigation = useNavigation<KamusDetailScreenNavigationProp>();
  
  /**
   * Route hook to access navigation parameters
   * Contains kamusId and potentially the kamus object itself
   */
  const route = useRoute<KamusDetailScreenRouteProp>();
  
  /**
   * State variables for managing component data and UI states
   * kamus: The dictionary entry data to display
   * negeri: The associated state data (if available)
   * loading: Indicates if data is being fetched
   * error: Stores any error messages
   */
  const [kamus, setKamus] = useState<Kamus | null>(route.params.kamus || null);
  const [negeri, setNegeri] = useState<Negeri | null>(null);
  const [loading, setLoading] = useState(!route.params.kamus);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Extract kamusId from route parameters
   * Used to fetch kamus data if not provided directly
   */
  const { kamusId } = route.params;
  
  /**
   * Repository instances for data access
   * Following dependency injection principle from SOLID
   */
  const kamusRepository = new KamusRepositoryImpl();
  const negeriRepository = new NegeriRepositoryImpl();
  
  /**
   * Fetch kamus and negeri data
   * Retrieves the dictionary entry details and its associated state
   * Handles loading states and error conditions
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If kamus is not provided in route params, fetch it
      if (!kamus) {
        const fetchedKamus = await kamusRepository.getKamusById(kamusId);
        
        if (!fetchedKamus) {
          setError('Perkataan tidak dijumpai.');
          setLoading(false);
          return;
        }
        
        setKamus(fetchedKamus);
      }
      
      // Fetch negeri data if kamus has negeriId
      if (kamus?.negeriId) {
        const fetchedNegeri = await negeriRepository.getNegeriById(kamus.negeriId);
        setNegeri(fetchedNegeri);
      }
    } catch (err) {
      setError('Gagal memuat data. Sila cuba lagi.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Navigate to negeri detail screen
   * Triggered when user taps on the negeri name
   * Passes the negeri object to the detail screen
   */
  const handleNegeriPress = () => {
    if (negeri) {
      navigation.navigate(ScreenNames.NEGERI_DETAIL, {
        negeriId: negeri.id,
        negeri: negeri,
      });
    }
  };
  
  /**
   * Effect hook to fetch data when component mounts
   * Depends on kamusId to refetch if the ID changes
   */
  useEffect(() => {
    fetchData();
  }, [kamusId]);
  
  /**
   * Render loading state with activity indicator
   * Shown while data is being fetched
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
   * Shown when data fetching fails or kamus is not found
   */
  if (error || !kamus) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Perkataan tidak dijumpai.'}</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Word and Negeri - Header section with word and associated state */}
        <View style={styles.header}>
          <Text style={styles.word}>{kamus.word}</Text>
          {(kamus.negeriName || negeri) && (
            <TouchableOpacity 
              style={styles.negeriContainer}
              onPress={handleNegeriPress}
              disabled={!negeri}
            >
              <Text style={styles.negeriLabel}>Negeri: </Text>
              <Text style={styles.negeriName}>
                {kamus.negeriName || negeri?.name || 'Tidak diketahui'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Meaning - Primary definition of the word */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maksud</Text>
          <Text style={styles.meaning}>{kamus.meaning}</Text>
        </View>
        
        {/* Example - Example usage of the word in context */}
        {kamus.example && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contoh</Text>
            <Text style={styles.example}>{kamus.example}</Text>
          </View>
        )}
        
        {/* Notes - Additional information about the word */}
        {kamus.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nota</Text>
            <Text style={styles.notes}>{kamus.notes}</Text>
          </View>
        )}
        
        {/* Tags - Categorization labels for the word */}
        {kamus.tags && kamus.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tag</Text>
            <View style={styles.tagsContainer}>
              {kamus.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Styles for KamusDetailScreen component
 * Defines the visual appearance of all UI elements
 * Organized by component section (container, header, sections, tags)
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
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 8,
  },
  negeriContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  negeriLabel: {
    fontSize: 14,
    color: '#666',
  },
  negeriName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066cc',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  meaning: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  example: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  notes: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e1f5fe',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    margin: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#0277bd',
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
});

export default KamusDetailScreen;
