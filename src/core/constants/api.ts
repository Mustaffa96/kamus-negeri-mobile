/**
 * API constants for Kamus Negeri application
 * Contains base URL and endpoint paths
 * Uses environment variables for sensitive configuration
 */
import { API_BASE_URL as ENV_API_BASE_URL } from '@env';

// Base API URL - fallback to default if environment variable is not set
export const API_BASE_URL = ENV_API_BASE_URL || 'https://kamus-negeri-backend.onrender.com';

// API endpoints
export const API_ENDPOINTS = {
  // Endpoint to get all states (negeri)
  NEGERI: '/negeri',
  
  // Endpoint to get all dictionary entries (kamus)
  KAMUS: '/kamus',
  
  // Endpoint to get dictionary entries by state ID
  KAMUS_BY_NEGERI: (negeriId: string) => `/kamus/negeri/${negeriId}`,
};
