/**
 * Kamus (Dictionary) entity
 * Represents a dictionary entry with its properties
 */
export interface Kamus {
  // Unique identifier for the dictionary entry
  id: string;
  
  // The word or phrase
  word: string;
  
  // Meaning or definition of the word
  meaning: string;
  
  // Example usage of the word in a sentence
  example?: string;
  
  // ID of the state (negeri) this word belongs to
  negeriId: string;
  
  // Name of the state this word belongs to
  negeriName?: string;
  
  // Additional notes or information about the word
  notes?: string;
  
  // Tags or categories for the word
  tags?: string[];
}
