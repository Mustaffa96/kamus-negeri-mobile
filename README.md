# Kamus Negeri Mobile App

A React Native mobile application for exploring Malaysian state-specific dictionaries and cultural information.

## About

Kamus Negeri is a mobile application that provides users with access to state-specific dictionaries (kamus) from various states (negeri) in Malaysia. The app allows users to explore words, meanings, and cultural context specific to different Malaysian states.

## Features

- **Home Screen**: Navigate to different sections of the app
- **Kamus List**: Browse all dictionary entries across states
- **Kamus Detail**: View detailed information about specific dictionary entries
- **Negeri List**: Explore different Malaysian states
- **Negeri Detail**: View state information and state-specific dictionary entries
- **Search**: Search for specific words across all dictionaries

## Technical Details

### Architecture

The application follows Clean Architecture principles with clear separation of concerns:

- **Domain Layer**: Contains business entities and repository interfaces
- **Data Layer**: Implements repositories and data sources
- **Presentation Layer**: Contains screens and UI components

### Performance Optimizations

The app includes several performance optimizations:

1. **Enhanced API Client**:
   - Request cancellation to prevent duplicate requests
   - Response caching with configurable expiration times
   - Cache invalidation on mutation requests
   - Improved error handling with specific error messages
   - Retry mechanism with stale cache fallback

2. **Optimized Repositories**:
   - Multi-level caching strategy (global and item-specific caches)
   - Cache expiration management
   - Efficient search indexing for faster text search
   - Fallback to stale cache on network errors
   - Selective cache invalidation

3. **Search Optimization**:
   - Text tokenization for more efficient search
   - Search index for faster keyword matching
   - Optimized search algorithm with fallback strategies

### Technologies Used

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform for React Native
- **TypeScript**: For type-safe code
- **React Navigation**: For screen navigation
- **Axios**: For API requests
- **ESLint**: For code quality and consistency

## Development

### Prerequisites

- Node.js (v14 or later)
- pnpm package manager
- Expo CLI

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/kamus-negeri-mobile.git
   cd kamus-negeri-mobile
   ```

2. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file to configure your environment variables as needed.

3. Install dependencies:
   ```
   pnpm install
   ```

4. Start the development server:
   ```
   pnpm start
   ```

### API

The app consumes data from the Kamus Negeri backend API:
```
https://kamus-negeri-backend.onrender.com/
```

## Project Structure

```
src/
├── core/               # Core functionality and constants
├── data/               # Data layer
│   ├── datasources/    # API client and data sources
│   └── repositories/   # Repository implementations
├── domain/             # Domain layer
│   ├── entities/       # Business entities
│   └── repositories/   # Repository interfaces
└── presentation/       # Presentation layer
    ├── components/     # Reusable UI components
    └── screens/        # App screens
```

## Recent Changes and Improvements

- Converted project to use pnpm as package manager
- Added comprehensive comments to all code files
- Implemented performance optimizations in API client and repositories
- Enhanced error handling and fallback mechanisms
- Improved search functionality with indexing
- Added multi-level caching strategy
- Implemented environment variables (.env) for secure API configuration

## License

[MIT License](LICENSE)

## Acknowledgements

- Based on the original project by [Mustaffa96](https://github.com/Mustaffa96/kamus-negeri)
