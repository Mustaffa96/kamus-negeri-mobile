/**
 * HomeScreen component
 * Main landing screen for the Kamus Negeri app
 * Provides search functionality, navigation to main app sections,
 * and displays information about the app
 */
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ScreenNames } from '../navigation/types';

/**
 * Type definition for navigation prop
 * Ensures type safety when using navigation methods
 */
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, ScreenNames.HOME>;

/**
 * HomeScreen component
 * Serves as the main entry point and dashboard for the application
 * Provides quick access to all main features of the app
 * @returns React component with search bar, main menu buttons, and about section
 */
const HomeScreen: React.FC = () => {
  /**
   * Navigation hook for screen transitions
   * Typed with HomeScreenNavigationProp for type safety
   */
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  /**
   * State for managing the search query input
   * Tracks what the user types in the search bar
   */
  const [searchQuery, setSearchQuery] = useState('');
  
  /**
   * Handle search submission
   * Navigates to the SearchScreen with the current query when search is submitted
   * Only navigates if the search query is not empty
   */
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate(ScreenNames.SEARCH, { initialQuery: searchQuery.trim() });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#0066cc" barStyle="light-content" />
      <ScrollView style={styles.container}>
        {/* Header - App title and subtitle */}
        <View style={styles.header}>
          <Text style={styles.title}>Kamus Negeri</Text>
          <Text style={styles.subtitle}>
            Kamus perkataan unik mengikut negeri di Malaysia
          </Text>
        </View>
        
        {/* Search Bar - Quick search functionality */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari perkataan..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Cari</Text>
          </TouchableOpacity>
        </View>
        
        {/* Main Menu - Navigation buttons to primary app features */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate(ScreenNames.KAMUS_LIST, {})}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.menuIconText}>📚</Text>
            </View>
            <Text style={styles.menuText}>Semua Perkataan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate(ScreenNames.NEGERI_LIST)}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#2196F3' }]}>
              <Text style={styles.menuIconText}>🏙️</Text>
            </View>
            <Text style={styles.menuText}>Negeri-negeri</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate(ScreenNames.SEARCH, {})}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FF9800' }]}>
              <Text style={styles.menuIconText}>🔍</Text>
            </View>
            <Text style={styles.menuText}>Carian Lanjutan</Text>
          </TouchableOpacity>
        </View>
        
        {/* About Section - Brief description of the app */}
        <View style={styles.aboutContainer}>
          <Text style={styles.aboutTitle}>Tentang Kamus Negeri</Text>
          <Text style={styles.aboutText}>
            Aplikasi Kamus Negeri mengumpulkan perkataan unik yang digunakan di negeri-negeri 
            berbeza di Malaysia. Setiap perkataan disertakan dengan maksud dan contoh penggunaan.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Styles for HomeScreen component
 * Defines the visual appearance of all UI elements
 * Organized by component section (container, header, search, menu, about)
 */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#0066cc',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e6e6e6',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
    marginTop: -20,
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
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 16,
  },
  menuItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuIconText: {
    fontSize: 24,
  },
  menuText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  aboutContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default HomeScreen;
