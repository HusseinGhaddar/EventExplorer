# Event Explorer

Event Explorer is a React Native application that helps users search, browse, and save live events happening in any city using the Ticketmaster Discovery API. The app is built with the new React Native architecture (0.76), TypeScript, Redux Toolkit, RTK Query, React Navigation, and MMKV.

## Features

- **Search** for events by city and/or keyword with optional category filters.
- **Infinite scrolling** list with graceful loading, empty, and error states.
- **Event detail view** with hero image, metadata, ticket link, and venue location opened via Google Maps deep link.
- **Favorites tab** powered by MMKV so saved events remain available offline.
- **Robust states** for loading, pagination, network failures, and pull-to-refresh.

## Requirements

- Node.js 18+ and Watchman (macOS) per [React Native environment setup](https://reactnative.dev/docs/environment-setup).
- Android Studio and/or Xcode depending on target platform.
- Ticketmaster Discovery API key.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Duplicate `.env.example` into `.env` and add your Ticketmaster key.
     ```env
     TICKETMASTER_API_KEY=YOUR_TICKETMASTER_KEY
     ```

3. **Run iOS pods (macOS)**
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Start Metro**
   ```bash
   npm start
   ```

5. **Launch the app**
   ```bash
   npm run android   # Android emulator / device
   npm run ios       # iOS simulator / device
   ```

6. **Run tests**
   ```bash
   npm test -- --runTestsByPath __tests__/App.test.tsx
   ```

## Project Structure

```
src/
  api/               # RTK Query service for Ticketmaster
  components/        # Reusable UI building blocks (cards, status messages)
  navigation/        # Stack + Tab navigators
  screens/           # Explore, Favorites, and Event details screens
  storage/           # MMKV helper + persistence helpers
  store/             # Redux store, slices, and typed hooks
  theme/             # Color palette + hook
  types/             # Shared TypeScript interfaces
```

### Implementation Notes
- Ticketmaster `/events` is consumed via RTK Query with pagination, loading, empty, and error states normalized into `EventSummary` and `EventDetail` types.
- Redux slices: filters, favorites, and theme; the root store wires in RTK Query middleware.
- MMKV persists favorites and theme preference through listener middleware.
- Event details deep-link to Google Maps using coordinates or address, and expose ticket URLs via `Linking.openURL`.
- Bonus: dark/light/system toggle and lightweight animations on event cards/navigation.

## Notes & Next Steps

- Ticketmaster rate limits apply; errors are surfaced via user-friendly banners and retry actions.
- Consider adding automated screenshots or a short demo video for submission as requested in the test instructions.

Happy building!
