/**
 * Implementation of NegeriRepository interface
 * Responsible for fetching Negeri (State) data from the API
 * Implements performance optimizations including caching and efficient data retrieval
 */
import { Negeri } from '../../domain/entities/Negeri';
import { NegeriRepository } from '../../domain/repositories/NegeriRepository';
import { ApiClient } from '../datasources/ApiClient';
import { API_ENDPOINTS } from '../../core/constants/api';

// Interface for cache entry with timestamp
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * NegeriRepositoryImpl class
 * Implements the NegeriRepository interface using the ApiClient
 * Includes performance optimizations for data retrieval
 */
export class NegeriRepositoryImpl implements NegeriRepository {
  // ApiClient instance for making HTTP requests
  private apiClient: ApiClient;
  
  // Cache for storing fetched negeri data to improve performance
  private negeriCache: CacheEntry<Negeri[]> | null = null;
  
  // Cache for individual negeri items by ID for quick lookup
  private negeriByIdCache: Map<string, CacheEntry<Negeri>> = new Map();
  
  // Cache expiration time in milliseconds (15 minutes)
  private cacheExpirationTime = 15 * 60 * 1000;
  
  /**
   * Constructor
   * @param apiClient - ApiClient instance for making HTTP requests
   */
  constructor(apiClient: ApiClient = ApiClient.getInstance()) {
    this.apiClient = apiClient;
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
   * Get all states (negeri)
   * Uses caching with expiration to improve performance for repeated calls
   * @returns Promise that resolves to an array of Negeri entities
   */
  async getAllNegeri(): Promise<Negeri[]> {
    try {
      // Return cached data if available and not expired
      if (this.isCacheValid(this.negeriCache)) {
        return this.negeriCache!.data;
      }
      
      // Fetch data from API
      const negeriList = await this.apiClient.get<Negeri[]>(API_ENDPOINTS.NEGERI);
      
      // Cache the fetched data with timestamp
      this.negeriCache = {
        data: negeriList,
        timestamp: Date.now()
      };
      
      // Also update individual negeri cache for each item
      negeriList.forEach(negeri => {
        this.negeriByIdCache.set(negeri.id, {
          data: negeri,
          timestamp: Date.now()
        });
      });
      
      return negeriList;
    } catch (error: unknown) {
      console.error('Error fetching all negeri entries:', error);
      
      // Return stale cache if available as fallback
      if (this.negeriCache) {
        console.warn('Returning stale cache as fallback');
        return this.negeriCache.data;
      }
      
      throw error;
    }
  }
  
  /**
   * Get a specific state (negeri) by its ID
   * Optimized to use individual item cache for faster retrieval
   * @param id - The ID of the state to retrieve
   * @returns Promise that resolves to a Negeri entity or null if not found
   */
  async getNegeriById(id: string): Promise<Negeri | null> {
    try {
      // Try to get from individual cache first if available and valid
      const cachedEntry = this.negeriByIdCache.get(id) || null;
      if (this.isCacheValid(cachedEntry)) {
        return cachedEntry!.data;
      }
      
      // Try to get from main cache if available and valid
      if (this.isCacheValid(this.negeriCache)) {
        const cachedNegeri = this.negeriCache!.data.find(negeri => negeri.id === id);
        if (cachedNegeri) {
          // Update individual cache
          this.negeriByIdCache.set(id, {
            data: cachedNegeri,
            timestamp: Date.now()
          });
          return cachedNegeri;
        }
      }
      
      // If not in any cache or cache expired, try direct API call first
      try {
        // Attempt to fetch just this specific negeri (if API supports it)
        const negeri = await this.apiClient.get<Negeri>(`${API_ENDPOINTS.NEGERI}/${id}`);
        
        // Update individual cache
        this.negeriByIdCache.set(id, {
          data: negeri,
          timestamp: Date.now()
        });
        
        return negeri;
      } catch (directError) {
        // If direct fetch fails, fall back to getting all negeri
        console.warn(`Direct fetch for negeri ID ${id} failed, falling back to full list`);
        
        // Fetch all negeri entries and then find the one with matching ID
        const allNegeri = await this.getAllNegeri();
        const foundNegeri = allNegeri.find(negeri => negeri.id === id) || null;
        
        // Update individual cache if found
        if (foundNegeri) {
          this.negeriByIdCache.set(id, {
            data: foundNegeri,
            timestamp: Date.now()
          });
        }
        
        return foundNegeri;
      }
    } catch (error: unknown) {
      console.error(`Error fetching negeri with ID ${id}:`, error);
      
      // Try stale individual cache as last resort
      const cachedEntry = this.negeriByIdCache.get(id);
      if (cachedEntry) {
        console.warn(`Returning stale cache for negeri ID ${id} as fallback`);
        return cachedEntry.data;
      }
      
      throw error;
    }
  }
  
  /**
   * Clear all negeri caches
   * Useful when we want to force a fresh fetch from the API
   */
  clearCache(): void {
    this.negeriCache = null;
    this.negeriByIdCache.clear();
  }
  
  /**
   * Clear cache for a specific negeri ID
   * @param id - The ID of the negeri to clear from cache
   */
  clearNegeriCache(id: string): void {
    this.negeriByIdCache.delete(id);
  }
}
