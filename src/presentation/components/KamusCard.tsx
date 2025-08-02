/**
 * KamusCard component
 * Displays a dictionary entry in a card format
 */
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Kamus } from '../../domain/entities/Kamus';

/**
 * Props for KamusCard component
 */
interface KamusCardProps {
  // The kamus (dictionary entry) to display
  kamus: Kamus;
  
  // Function to call when the card is pressed
  onPress: (kamus: Kamus) => void;
}

/**
 * KamusCard component
 * @param props - Component props
 * @returns React component
 */
const KamusCard: React.FC<KamusCardProps> = ({ kamus, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(kamus)}
      activeOpacity={0.7}
    >
      <View style={styles.container}>
        <Text style={styles.word}>{kamus.word}</Text>
        {kamus.negeriName && (
          <Text style={styles.negeri}>{kamus.negeriName}</Text>
        )}
        <Text style={styles.meaning} numberOfLines={2}>{kamus.meaning}</Text>
        {kamus.example && (
          <Text style={styles.example} numberOfLines={1}>
            <Text style={styles.exampleLabel}>Contoh: </Text>
            {kamus.example}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Styles for KamusCard component
 */
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  container: {
    flex: 1,
  },
  word: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  negeri: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  meaning: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  example: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  exampleLabel: {
    fontWeight: 'bold',
    fontStyle: 'normal',
  },
});

export default KamusCard;
