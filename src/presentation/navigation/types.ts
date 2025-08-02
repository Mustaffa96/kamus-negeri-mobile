/**
 * Navigation types for the application
 * Defines the screen names and parameters for type safety
 */
import { Kamus } from '../../domain/entities/Kamus';
import { Negeri } from '../../domain/entities/Negeri';

/**
 * Enum for screen names to avoid string literals
 */
export enum ScreenNames {
  HOME = 'Home',
  KAMUS_LIST = 'KamusList',
  KAMUS_DETAIL = 'KamusDetail',
  NEGERI_LIST = 'NegeriList',
  NEGERI_DETAIL = 'NegeriDetail',
  SEARCH = 'Search',
}

/**
 * RootStackParamList type
 * Defines the parameters for each screen in the navigation stack
 */
export type RootStackParamList = {
  // Home screen - no parameters needed
  [ScreenNames.HOME]: undefined;
  
  // Kamus List screen - can filter by negeriId
  [ScreenNames.KAMUS_LIST]: {
    negeriId?: string;
    title?: string;
  };
  
  // Kamus Detail screen - requires a kamus item or ID
  [ScreenNames.KAMUS_DETAIL]: {
    kamusId: string;
    kamus?: Kamus;
  };
  
  // Negeri List screen - no parameters needed
  [ScreenNames.NEGERI_LIST]: undefined;
  
  // Negeri Detail screen - requires a negeri item or ID
  [ScreenNames.NEGERI_DETAIL]: {
    negeriId: string;
    negeri?: Negeri;
  };
  
  // Search screen - optional initial search query
  [ScreenNames.SEARCH]: {
    initialQuery?: string;
  };
};
