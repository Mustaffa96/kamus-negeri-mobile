/**
 * KamusRepository interface
 * Defines methods for accessing Kamus (Dictionary) data
 * Following SOLID principles - specifically Dependency Inversion
 */
import { Kamus } from '../entities/Kamus';

export interface KamusRepository {
  /**
   * Get all dictionary entries
   * @returns Promise that resolves to an array of Kamus entities
   */
  getAllKamus(): Promise<Kamus[]>;
  
  /**
   * Get a specific dictionary entry by its ID
   * @param id - The ID of the dictionary entry to retrieve
   * @returns Promise that resolves to a Kamus entity or null if not found
   */
  getKamusById(id: string): Promise<Kamus | null>;
  
  /**
   * Get dictionary entries by state (negeri) ID
   * @param negeriId - The ID of the state to filter by
   * @returns Promise that resolves to an array of Kamus entities
   */
  getKamusByNegeriId(negeriId: string): Promise<Kamus[]>;
  
  /**
   * Search dictionary entries by keyword
   * @param keyword - The keyword to search for in words and meanings
   * @returns Promise that resolves to an array of Kamus entities
   */
  searchKamus(keyword: string): Promise<Kamus[]>;
}
