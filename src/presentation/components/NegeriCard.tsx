/**
 * NegeriCard component
 * Displays a state (negeri) in a card format
 */
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Negeri } from '../../domain/entities/Negeri';

/**
 * Props for NegeriCard component
 */
interface NegeriCardProps {
  // The negeri (state) to display
  negeri: Negeri;
  
  // Function to call when the card is pressed
  onPress: (negeri: Negeri) => void;
}

/**
 * NegeriCard component
 * @param props - Component props
 * @returns React component
 */
const NegeriCard: React.FC<NegeriCardProps> = ({ negeri, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(negeri)}
      activeOpacity={0.7}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.name}>{negeri.name}</Text>
          {negeri.capital && (
            <Text style={styles.capital}>Ibu Negeri: {negeri.capital}</Text>
          )}
        </View>
        
        <View style={styles.imageContainer}>
          {negeri.flag && (
            <Image 
              source={{ uri: negeri.flag }} 
              style={styles.flag}
              resizeMode="contain"
            />
          )}
          {negeri.emblem && (
            <Image 
              source={{ uri: negeri.emblem }} 
              style={styles.emblem}
              resizeMode="contain"
            />
          )}
        </View>
        
        {negeri.description && (
          <Text style={styles.description} numberOfLines={3}>
            {negeri.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Styles for NegeriCard component
 */
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  capital: {
    fontSize: 14,
    color: '#666',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    height: 80,
  },
  flag: {
    width: '48%',
    height: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  emblem: {
    width: '48%',
    height: '100%',
  },
  description: {
    fontSize: 14,
    color: '#333',
  },
});

export default NegeriCard;
