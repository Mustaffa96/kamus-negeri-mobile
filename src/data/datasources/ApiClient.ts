/**
 * ApiClient for making HTTP requests to the backend API
 * Uses axios for HTTP requests with optimized performance
 * Includes request cancellation, caching, and retry mechanisms
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { API_BASE_URL } from '../../core/constants/api';

// Interface for cache entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * ApiClient class for handling API requests
 * Implements singleton pattern for efficient resource usage
 * Includes request optimization features for better performance
 */
export class ApiClient {
  // Singleton instance
  private static instance: ApiClient;
  
  // Axios instance for making HTTP requests
  private axiosInstance: AxiosInstance;
  
  // Request cache for GET requests
  private requestCache: Map<string, CacheEntry<any>> = new Map();
  
  // Default cache expiration time (5 minutes)
  private defaultCacheExpiration = 5 * 60 * 1000;
  
  // Active request cancellation tokens
  private activeRequests: Map<string, CancelTokenSource> = new Map();
  
  /**
   * Private constructor to prevent direct instantiation
   * Creates and configures an axios instance with optimized settings
   */
  private constructor() {
    // Temporarily hardcode the API URL to debug network issues
    const hardcodedApiUrl = 'https://kamus-negeri-backend.onrender.com';
    
    console.log('Initializing ApiClient with baseURL:', API_BASE_URL);
    console.log('Using hardcoded API URL for debugging:', hardcodedApiUrl);
    
    // Create axios instance with optimized configuration
    this.axiosInstance = axios.create({
      baseURL: hardcodedApiUrl, // Use hardcoded URL temporarily
      timeout: 30000, // 30 seconds timeout (increased for slower connections)
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Enable HTTP keep-alive for connection reuse
      httpAgent: undefined, // Let axios use default agent with keepAlive
      // Disable automatic transformations for better performance
      transformResponse: [(data) => {
        try {
          return JSON.parse(data);
        } catch (e) {
          return data;
        }
      }],
    });
    
    // Test the API connection
    this.testApiConnection();
    
    // Add request interceptor for handling duplicate requests
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Only apply cancellation to GET requests
        if (config.method?.toLowerCase() === 'get' && config.url) {
          // Cancel any existing request to the same URL
          this.cancelActiveRequest(config.url);
          
          // Create a new cancel token
          const source = axios.CancelToken.source();
          config.cancelToken = source.token;
          
          // Store the cancel token
          this.activeRequests.set(config.url, source);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Add response interceptor for error handling and cleanup
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Remove from active requests on successful response
        if (response.config.url) {
          this.activeRequests.delete(response.config.url);
        }
        return response;
      },
      (error) => {
        // Handle network errors
        if (error.message === 'Network Error') {
          console.error('Network error detected. Please check your connection.');
        }
        
        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
          console.error('Request timed out. The server might be slow or unavailable.');
        }
        
        // Remove from active requests on error
        if (error.config?.url) {
          this.activeRequests.delete(error.config.url);
        }
        
        // Don't reject if request was cancelled intentionally
        if (axios.isCancel(error)) {
          console.log('Request cancelled:', error.message);
          return Promise.resolve({ data: null, status: 'cancelled' });
        }
        
        // Log other errors for debugging
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Test the API connection to verify the API is reachable
   * This helps identify network issues early
   * @returns Promise that resolves when the test is complete
   */
  private async testApiConnection(): Promise<void> {
    // Test with hardcoded URL
    const hardcodedApiUrl = 'https://kamus-negeri-backend.onrender.com';
    
    try {
      console.log('Testing API connection to hardcoded URL:', hardcodedApiUrl);
      const testAxios = axios.create({
        baseURL: hardcodedApiUrl,
        timeout: 10000
      });
      
      try {
        const response = await testAxios.get('/negeri');
        console.log('Hardcoded API connection test successful');
        console.log('Response status:', response.status);
        console.log('Response data count:', Array.isArray(response.data) ? response.data.length : 'Not an array');
      } catch (hardcodedError) {
        console.warn('Hardcoded API connection test failed:', hardcodedError);
      }
      
      // Test with environment variable URL
      console.log('Testing API connection to env URL:', API_BASE_URL);
      const envAxios = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000
      });
      
      try {
        const response = await envAxios.get('/negeri');
        console.log('Env API connection test successful');
        console.log('Response status:', response.status);
        console.log('Response data count:', Array.isArray(response.data) ? response.data.length : 'Not an array');
      } catch (envError) {
        console.warn('Env API connection test failed:', envError);
      }
      
      console.log('API connection tests completed');
    } catch (error) {
      console.warn('API connection tests failed completely:', error);
      console.warn('API_BASE_URL value:', API_BASE_URL);
      console.warn('This might cause issues with API requests. Please check your network connection and API URL.');
    }
  }
  
  /**
   * Get singleton instance of ApiClient
   * @returns ApiClient instance
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }
  
  /**
   * Cancel an active request by URL
   * @param url - The URL of the request to cancel
   */
  private cancelActiveRequest(url: string): void {
    const source = this.activeRequests.get(url);
    if (source) {
      source.cancel(`Request to ${url} cancelled due to duplicate request`);
      this.activeRequests.delete(url);
    }
  }
  
  /**
   * Check if a cached response is valid
   * @param cacheKey - The cache key to check
   * @returns The cached data if valid, otherwise null
   */
  private getValidCacheData<T>(cacheKey: string): T | null {
    const cachedEntry = this.requestCache.get(cacheKey);
    
    if (cachedEntry && Date.now() < cachedEntry.expiresAt) {
      return cachedEntry.data;
    }
    
    // Remove expired cache entry
    if (cachedEntry) {
      this.requestCache.delete(cacheKey);
    }
    
    return null;
  }
  
  /**
   * Store data in the cache
   * @param cacheKey - The cache key
   * @param data - The data to cache
   * @param expirationMs - Optional custom expiration time in milliseconds
   */
  private setCacheData<T>(cacheKey: string, data: T, expirationMs?: number): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + (expirationMs || this.defaultCacheExpiration);
    
    this.requestCache.set(cacheKey, {
      data,
      timestamp,
      expiresAt
    });
  }
  
  /**
   * Make a GET request to the API with caching
   * @param url - The URL to make the request to
   * @param config - Optional axios request configuration
   * @param cacheOptions - Optional caching options
   * @returns Promise that resolves to the response data
   */
  public async get<T>(url: string, config?: AxiosRequestConfig, cacheOptions?: { skipCache?: boolean; expirationMs?: number }): Promise<T> {
    // Generate cache key from URL and any query parameters
    const cacheKey = url + (config?.params ? JSON.stringify(config.params) : '');
    
    // Check if we have a valid cached response
    if (!cacheOptions?.skipCache) {
      const cachedData = this.getValidCacheData<T>(cacheKey);
      if (cachedData) {
        console.log(`Using cached data for ${url}`);
        return cachedData;
      }
    }
    
    try {
      console.log(`Making fresh request to ${url}`);
      console.log(`Full URL: ${this.axiosInstance.defaults.baseURL}${url}`);
      
      // Make the request
      const response: AxiosResponse<T> = await this.axiosInstance.get<T>(url, config);
      
      console.log(`Response status for ${url}: ${response.status}`);
      console.log(`Response data type: ${typeof response.data}`);
      if (Array.isArray(response.data)) {
        console.log(`Response is array with ${response.data.length} items`);
      }
      
      // Cache the response
      if (!cacheOptions?.skipCache) {
        this.setCacheData(cacheKey, response.data, cacheOptions?.expirationMs);
      }
      
      return response.data;
    } catch (error: unknown) {
      // Enhanced error handling with detailed diagnostics
      console.error(`Error in API request to ${url}:`);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK') {
          console.error('Network error details:');
          console.error('- Full URL:', `${this.axiosInstance.defaults.baseURL}${url}`);
          console.error('- Error message:', error.message);
          console.error('- Error code:', error.code);
          console.error('- Is API server reachable? Check your internet connection');
          console.error('- Check if the API server is running');
          console.error('- Check if there are any CORS issues');
        } else if (error.response) {
          console.error('- Status:', error.response.status);
          console.error('- Status Text:', error.response.statusText);
          console.error('- Response data:', error.response.data);
        }
      } else {
        console.error('Unknown error:', error);
      }
      
      // If request fails, try to return stale cache as fallback
      const cachedEntry = this.requestCache.get(cacheKey);
      if (cachedEntry) {
        console.log('Request failed, returning stale cached data as fallback');
        return cachedEntry.data;
      }
      
      // Throw a more informative error
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        throw new Error(
          `Network error when connecting to ${this.axiosInstance.defaults.baseURL}${url}. ` +
          `Please check your internet connection and API URL configuration.`
        );
      }
      
      throw error;
    }
  }
  
  /**
   * Make a POST request to the API
   * Automatically invalidates related GET cache entries
   * @param url - The URL to make the request to
   * @param data - The data to send in the request body
   * @param config - Optional axios request configuration
   * @returns Promise that resolves to the response data
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post<T>(url, data, config);
      
      // Invalidate related cache entries
      this.invalidateRelatedCache(url);
      
      return response.data;
    } catch (error: unknown) {
      // Enhance error with request details for better debugging
      if (axios.isAxiosError(error) && error.response) {
        console.error(`POST request to ${url} failed with status ${error.response.status}`);
        console.error('Request data:', data);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }
  
  /**
   * Make a PUT request to the API
   * Automatically invalidates related GET cache entries
   * @param url - The URL to make the request to
   * @param data - The data to send in the request body
   * @param config - Optional axios request configuration
   * @returns Promise that resolves to the response data
   */
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put<T>(url, data, config);
      
      // Invalidate related cache entries
      this.invalidateRelatedCache(url);
      
      return response.data;
    } catch (error: unknown) {
      // Enhance error with request details for better debugging
      if (axios.isAxiosError(error) && error.response) {
        console.error(`PUT request to ${url} failed with status ${error.response.status}`);
        console.error('Request data:', data);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }
  
  /**
   * Make a DELETE request to the API
   * Automatically invalidates related GET cache entries
   * @param url - The URL to make the request to
   * @param config - Optional axios request configuration
   * @returns Promise that resolves to the response data
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.delete<T>(url, config);
      
      // Invalidate related cache entries
      this.invalidateRelatedCache(url);
      
      return response.data;
    } catch (error: unknown) {
      // Enhance error with request details for better debugging
      if (axios.isAxiosError(error) && error.response) {
        console.error(`DELETE request to ${url} failed with status ${error.response.status}`);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }
  
  /**
   * Invalidate cache entries related to a specific URL
   * Used after mutations (POST, PUT, DELETE) to ensure data consistency
   * @param url - The URL that was modified
   */
  private invalidateRelatedCache(url: string): void {
    // Extract the base resource path from the URL
    const urlParts = url.split('/');
    const resourcePath = urlParts[0]; // First part of the path
    
    // Invalidate all cache entries related to this resource
    for (const cacheKey of this.requestCache.keys()) {
      if (cacheKey.includes(resourcePath)) {
        this.requestCache.delete(cacheKey);
      }
    }
  }
  
  /**
   * Clear the entire request cache
   * Useful when logging out or when data consistency is critical
   */
  public clearCache(): void {
    this.requestCache.clear();
  }
  
  /**
   * Get the base URL used for API requests
   * @returns The base URL string
   */
  public getBaseUrl(): string {
    // Return the base URL from the axios instance
    return this.axiosInstance.defaults.baseURL || '';
  }
  
  /**
   * Debug method to test API connectivity and log response
   * @param endpoint - The API endpoint to test
   * @returns Promise that resolves to the response data or error message
   */
  public async debugApiEndpoint<T>(endpoint: string): Promise<{success: boolean, data?: T, error?: string}> {
    console.log(`[DEBUG] Testing API endpoint: ${endpoint}`);
    console.log(`[DEBUG] Full URL: ${this.axiosInstance.defaults.baseURL}${endpoint}`);
    
    try {
      const response = await this.axiosInstance.get<T>(endpoint);
      
      console.log(`[DEBUG] Response status: ${response.status}`);
      console.log(`[DEBUG] Response data type: ${typeof response.data}`);
      console.log(`[DEBUG] Response is array: ${Array.isArray(response.data)}`);
      if (Array.isArray(response.data)) {
        console.log(`[DEBUG] Array length: ${response.data.length}`);
        if (response.data.length > 0) {
          console.log(`[DEBUG] First item sample:`, JSON.stringify(response.data[0]).substring(0, 200));
        }
      }
      
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error(`[DEBUG] API request failed:`, error);
      let errorMessage = 'Unknown error';
      
      if (error.response) {
        errorMessage = `Status: ${error.response.status}, Message: ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorMessage = 'No response received from server';
      } else {
        errorMessage = error.message || 'Request setup error';
      }
      
      console.error(`[DEBUG] Error details: ${errorMessage}`);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}
