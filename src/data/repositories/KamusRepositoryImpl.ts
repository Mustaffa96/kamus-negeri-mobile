/**
 * Implementation of KamusRepository interface
 * Responsible for fetching Kamus (Dictionary) data from the API
 * Implements performance optimizations including caching and efficient search
 */
import { Kamus } from '../../domain/entities/Kamus';
import { KamusRepository } from '../../domain/repositories/KamusRepository';
import { ApiClient } from '../datasources/ApiClient';
import { API_ENDPOINTS } from '../../core/constants/api';

/**
 * Interface for API response format
 * This matches the actual structure returned by the backend
 */
interface KamusApiResponse {
  id: string | number;
  dialek: string;        // 'word' in our app
  maksud: string;        // 'meaning' in our app
  contoh_ayat?: string;  // 'example' in our app
  negeri_id: string | number;
  negeri?: {
    id: number | string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Interface for cache entry with timestamp
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * KamusRepositoryImpl class
 * Implements the KamusRepository interface using the ApiClient
 * Includes performance optimizations for data retrieval and search
 */
export class KamusRepositoryImpl implements KamusRepository {
  // ApiClient instance for making HTTP requests
  private apiClient: ApiClient;
  
  // Cache for storing fetched kamus data to improve performance
  private kamusCache: CacheEntry<Kamus[]> | null = null;
  
  // Cache for storing kamus entries by negeri ID
  private kamusByNegeriCache: Map<string, CacheEntry<Kamus[]>> = new Map();
  
  // Cache expiration time in milliseconds (10 minutes)
  private cacheExpirationTime = 10 * 60 * 1000;
  
  // Search index for faster text search
  private searchIndex: Map<string, Set<string>> = new Map();
  
  /**
   * Constructor
   * @param apiClient - ApiClient instance for making HTTP requests
   */
  constructor(apiClient: ApiClient = ApiClient.getInstance()) {
    this.apiClient = apiClient;
  }
  
  /**
   * Maps API response to Kamus entity
   * @param apiResponse - The raw API response
   * @returns Kamus entity with correct field names
   */
  /**
   * Maps API response to Kamus entity with improved error handling
   * @param apiResponse - The API response to map
   * @returns Mapped Kamus entity
   */
  private mapApiResponseToKamus(apiResponse: KamusApiResponse): Kamus {
    // Log the mapping process for debugging
    console.log('Mapping API response to Kamus:', JSON.stringify(apiResponse).substring(0, 100));
    
    // Validate required fields
    if (!apiResponse.id) {
      console.warn('API response missing id field');
    }
    if (!apiResponse.dialek) {
      console.warn('API response missing dialek (word) field');
    }
    if (!apiResponse.maksud) {
      console.warn('API response missing maksud (meaning) field');
    }
    
    // Create Kamus entity with fallbacks for missing data
    return {
      id: apiResponse.id ? String(apiResponse.id) : `unknown-${Date.now()}`,
      word: apiResponse.dialek || 'Unknown Word',
      meaning: apiResponse.maksud || 'No meaning provided',
      example: apiResponse.contoh_ayat,
      negeriId: apiResponse.negeri_id ? String(apiResponse.negeri_id) : '0',
      negeriName: apiResponse.negeri?.name || 'Unknown Region',
    };
  }
  
  /**
   * Build search index from kamus entries for faster text search
   * @param kamusList - The list of kamus entries to index
   */
  private buildSearchIndex(kamusList: Kamus[]): void {
    // Clear existing index
    this.searchIndex.clear();
    
    // Process each kamus entry
    kamusList.forEach(kamus => {
      // Process word and meaning into tokens
      const wordTokens = this.tokenizeText(kamus.word);
      const meaningTokens = this.tokenizeText(kamus.meaning);
      
      // Combine all tokens
      const allTokens = new Set([...wordTokens, ...meaningTokens]);
      
      // Add to index
      allTokens.forEach(token => {
        if (!this.searchIndex.has(token)) {
          this.searchIndex.set(token, new Set());
        }
        this.searchIndex.get(token)?.add(kamus.id);
      });
    });
  }
  
  /**
   * Tokenize text into searchable tokens
   * @param text - The text to tokenize
   * @returns Array of lowercase tokens
   */
  private tokenizeText(text: string): string[] {
    if (!text) return [];
    
    // Convert to lowercase and split by non-alphanumeric characters
    return text.toLowerCase()
      .split(/[^\w]/) // Split by non-word characters
      .filter(token => token.length > 1) // Filter out single-character tokens
      .map(token => token.trim())
      .filter(Boolean); // Remove empty strings
  }
  
  /**
   * Check if cache is valid (not expired)
   * @param cache - The cache entry to check
   * @returns True if cache is valid, false otherwise
   */
  private isCacheValid<T>(cache: CacheEntry<T> | null): boolean {
    if (!cache) return false;
    return (Date.now() - cache.timestamp) < this.cacheExpirationTime;
  }
  
  /**
   * Get all dictionary entries
   * Uses caching with expiration to improve performance for repeated calls
   * @returns Promise that resolves to an array of Kamus entities
   */
  async getAllKamus(): Promise<Kamus[]> {
    try {
      // Return cached data if available and not expired
      if (this.isCacheValid(this.kamusCache)) {
        console.log('Using valid cache for kamus data');
        return this.kamusCache!.data;
      }
      
      console.log('Fetching kamus data from API...', API_ENDPOINTS.KAMUS);
      
      // Debug the full URL being called
      const fullUrl = `${this.apiClient.getBaseUrl()}${API_ENDPOINTS.KAMUS}`;
      console.log('Full URL being called:', fullUrl);
      
      // Fetch data from API
      const apiResponse = await this.apiClient.get<KamusApiResponse[]>(API_ENDPOINTS.KAMUS);
      
      // Debug API response
      console.log('API response type:', typeof apiResponse);
      console.log('API response is array:', Array.isArray(apiResponse));
      
      if (!apiResponse) {
        console.error('API response is null or undefined');
        throw new Error('API response is null or undefined');
      }
      
      // Create a mutable copy of the response for potential transformation
      let processedResponse = apiResponse;
      
      if (!Array.isArray(processedResponse)) {
        console.error('Invalid API response format. Expected array but got:', typeof processedResponse);
        console.log('Attempting to convert to array if possible...');
        
        // Try to handle non-array responses
        if (typeof processedResponse === 'object') {
          // If it's a single object, wrap it in an array
          processedResponse = [processedResponse];
          console.log('Converted single object to array');
        } else {
          throw new Error('Invalid API response format: cannot convert to array');
        }
      }
      
      // Log the first item for debugging
      if (processedResponse.length > 0) {
        console.log('First API response item:', JSON.stringify(processedResponse[0]).substring(0, 200));
      } else {
        console.warn('API returned empty array');
      }
      
      // Map API response to Kamus entities
      const kamusList = processedResponse.map(item => {
        try {
          return this.mapApiResponseToKamus(item);
        } catch (err) {
          console.error('Error mapping item to Kamus:', err);
          console.error('Problematic item:', JSON.stringify(item));
          // Return a placeholder item to prevent the entire list from failing
          return {
            id: 'error-' + Math.random().toString(36).substring(2, 9),
            word: 'Error loading item',
            meaning: 'There was an error processing this item',
            negeriId: '0',
            negeriName: 'Unknown'
          };
        }
      });
      
      console.log('Mapped to Kamus entities, count:', kamusList.length);
      
      // Cache the results
      this.kamusCache = {
        data: kamusList,
        timestamp: Date.now()
      };
      
      // Build search index for faster searching
      this.buildSearchIndex(kamusList);
      
      return kamusList;
    } catch (error: unknown) {
      console.error('Error fetching all kamus data:', error);
      
      // Return stale cache if available as fallback
      if (this.kamusCache) {
        console.warn('Returning stale cache as fallback, items:', this.kamusCache.data.length);
        return this.kamusCache.data;
      }
      
      throw error;
    }
  }
  
  /**
   * Get a specific dictionary entry by its ID
   * Optimized to use cache efficiently
   * @param id - The ID of the dictionary entry to retrieve
   * @returns Promise that resolves to a Kamus entity or null if not found
   */
  async getKamusById(id: string): Promise<Kamus | null> {
    try {
      // Try to get from cache first if available and valid
      if (this.isCacheValid(this.kamusCache)) {
        const cachedKamus = this.kamusCache!.data.find(kamus => kamus.id === id);
        if (cachedKamus) {
          return cachedKamus;
        }
      }
      
      // If not in cache or cache expired, fetch all kamus entries and then find the one with matching ID
      const allKamus = await this.getAllKamus();
      return allKamus.find(kamus => kamus.id === id) || null;
    } catch (error: unknown) {
      console.error(`Error fetching kamus with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get dictionary entries by state (negeri) ID
   * Uses dedicated cache for each negeri ID to improve performance
   * @param negeriId - The ID of the state to filter by
   * @returns Promise that resolves to an array of Kamus entities
   */
  async getKamusByNegeriId(negeriId: string): Promise<Kamus[]> {
    try {
      // Check if we have valid cached data for this negeri ID
      const cachedEntry = this.kamusByNegeriCache.get(negeriId) || null;
      if (this.isCacheValid(cachedEntry)) {
        console.log(`Using valid cache for negeri ID ${negeriId}`);
        return cachedEntry!.data;
      }
      
      console.log(`Fetching kamus data for negeri ID ${negeriId}...`);
      // Use the specific endpoint for getting kamus by negeri ID
      const apiResponse = await this.apiClient.get<KamusApiResponse[]>(API_ENDPOINTS.KAMUS_BY_NEGERI(negeriId));
      
      // Debug API response
      console.log('API response type:', typeof apiResponse);
      console.log('API response is array:', Array.isArray(apiResponse));
      
      if (!apiResponse) {
        console.error('API response is null or undefined');
        throw new Error('API response is null or undefined');
      }
      
      // Create a mutable copy of the response for potential transformation
      let processedResponse = apiResponse;
      
      if (!Array.isArray(processedResponse)) {
        console.error('Invalid API response format. Expected array but got:', typeof processedResponse);
        console.log('Attempting to convert to array if possible...');
        
        // Try to handle non-array responses
        if (typeof processedResponse === 'object') {
          // If it's a single object, wrap it in an array
          processedResponse = [processedResponse];
          console.log('Converted single object to array');
        } else {
          throw new Error('Invalid API response format: cannot convert to array');
        }
      }
      
      // Log the first item for debugging
      if (processedResponse.length > 0) {
        console.log('First API response item:', JSON.stringify(processedResponse[0]).substring(0, 200));
      } else {
        console.warn('API returned empty array');
      }
      
      // Map API response to Kamus entities with error handling
      const kamusList = processedResponse.map(item => {
        try {
          return this.mapApiResponseToKamus(item);
        } catch (err) {
          console.error('Error mapping item to Kamus:', err);
          console.error('Problematic item:', JSON.stringify(item));
          // Return a placeholder item to prevent the entire list from failing
          return {
            id: 'error-' + Math.random().toString(36).substring(2, 9),
            word: 'Error loading item',
            meaning: 'There was an error processing this item',
            negeriId: negeriId,
            negeriName: 'Unknown'
          };
        }
      });
      
      // Cache the results for this negeri ID
      this.kamusByNegeriCache.set(negeriId, {
        data: kamusList,
        timestamp: Date.now()
      });
      
      return kamusList;
    } catch (error: unknown) {
      console.error(`Error fetching kamus entries for negeri ID ${negeriId}:`, error);
      
      // Return stale cache if available as fallback
      const cachedEntry = this.kamusByNegeriCache.get(negeriId) || null;
      if (cachedEntry) {
        console.warn(`Returning stale cache for negeri ID ${negeriId} as fallback`);
        return cachedEntry.data;
      }
      
      throw error;
    }
  }
  
  /**
   * Search dictionary entries by keyword
   * Uses optimized search index for faster searching
   * @param keyword - The keyword to search for in words and meanings
   * @returns Promise that resolves to an array of Kamus entities
   */
  async searchKamus(keyword: string): Promise<Kamus[]> {
    try {
      // Trim and validate keyword
      const trimmedKeyword = keyword.trim();
      if (!trimmedKeyword) {
        return [];
      }
      
      // Get all kamus entries and ensure search index is built
      const allKamus = await this.getAllKamus();
      
      // If the search index is empty (should not happen), build it
      if (this.searchIndex.size === 0) {
        this.buildSearchIndex(allKamus);
      }
      
      // For very short queries (1-2 chars), use simple filtering
      if (trimmedKeyword.length <= 2) {
        const lowercaseKeyword = trimmedKeyword.toLowerCase();
        return allKamus.filter(kamus => 
          kamus.word.toLowerCase().includes(lowercaseKeyword) || 
          kamus.meaning.toLowerCase().includes(lowercaseKeyword)
        );
      }
      
      // For longer queries, use the search index
      const searchTokens = this.tokenizeText(trimmedKeyword);
      
      // If no valid tokens, return empty results
      if (searchTokens.length === 0) {
        return [];
      }
      
      // Find matching IDs from search index
      let matchingIds: Set<string> | undefined;
      
      searchTokens.forEach(token => {
        const tokenMatches = this.searchIndex.get(token);
        
        if (tokenMatches) {
          if (matchingIds === undefined) {
            // First token, initialize the set
            matchingIds = new Set(tokenMatches);
          } else {
            // Subsequent tokens, intersect with existing matches
            const intersection = new Set<string>();
            for (const id of matchingIds) {
              if (tokenMatches.has(id)) {
                intersection.add(id);
              }
            }
            matchingIds = intersection;
          }
        }
      });
      
      // If no matches found, try fallback to simple search
      if (!matchingIds || matchingIds?.size === 0) {
        const lowercaseKeyword = trimmedKeyword.toLowerCase();
        return allKamus.filter(kamus => 
          kamus.word.toLowerCase().includes(lowercaseKeyword) || 
          kamus.meaning.toLowerCase().includes(lowercaseKeyword)
        );
      }
      
      // Get the actual kamus objects for the matching IDs
      return allKamus.filter(kamus => matchingIds!.has(kamus.id));
    } catch (error: unknown) {
      console.error(`Error searching kamus with keyword "${keyword}":`, error);
      throw error;
    }
  }
  
  /**
   * Clear all kamus caches
   * Useful when we want to force a fresh fetch from the API
   */
  clearCache(): void {
    this.kamusCache = null;
    this.kamusByNegeriCache.clear();
    this.searchIndex.clear();
  }
  
  /**
   * Clear specific negeri cache
   * @param negeriId - The ID of the state cache to clear
   */
  clearNegeriCache(negeriId: string): void {
    this.kamusByNegeriCache.delete(negeriId);
  }
}
