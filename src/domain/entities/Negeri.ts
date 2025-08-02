/**
 * Negeri (State) entity
 * Represents a Malaysian state with its properties
 */
export interface Negeri {
  // Unique identifier for the state
  id: string;
  
  // Name of the state
  name: string;
  
  // Description or information about the state
  description?: string;
  
  // Capital city of the state
  capital?: string;
  
  // URL to the state's flag image
  flag?: string;
  
  // URL to the state's coat of arms image
  emblem?: string;
}
