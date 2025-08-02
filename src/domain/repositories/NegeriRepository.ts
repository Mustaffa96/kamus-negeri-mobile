/**
 * NegeriRepository interface
 * Defines methods for accessing Negeri (State) data
 * Following SOLID principles - specifically Dependency Inversion
 */
import { Negeri } from '../entities/Negeri';

export interface NegeriRepository {
  /**
   * Get all states (negeri)
   * @returns Promise that resolves to an array of Negeri entities
   */
  getAllNegeri(): Promise<Negeri[]>;
  
  /**
   * Get a specific state by its ID
   * @param id - The ID of the state to retrieve
   * @returns Promise that resolves to a Negeri entity or null if not found
   */
  getNegeriById(id: string): Promise<Negeri | null>;
}
