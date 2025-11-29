# Event Explorer

Event Explorer is a React Native application that helps users search, browse, and save live events happening in any city using the Ticketmaster Discovery API. The app is built with the new React Native architecture (0.76), TypeScript, Redux Toolkit, RTK Query, React Navigation, MMKV, and react-native-maps.

## Features

- **Search** for events by city and/or keyword with optional category filters.
- **Infinite scrolling** list with graceful loading, empty, and error states.
- **Event detail view** with hero image, metadata, ticket link, and venue location rendered in `react-native-maps`.
- **Favorites tab** powered by MMKV so saved events remain available offline.
- **Robust states** for loading, pagination, network failures, and pull-to-refresh.

## Requirements

- Node.js 18+ and Watchman (macOS) per [React Native environment setup](https://reactnative.dev/docs/environment-setup).
- Android Studio and/or Xcode depending on target platform.
- Ticketmaster Discovery API key.
- Google Maps API key (Android) for `react-native-maps`.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   - Duplicate `.env.example` into `.env` and add your Ticketmaster key.
     ```env
     TICKETMASTER_API_KEY=YOUR_TICKETMASTER_KEY
     MAPS_API_KEY=YOUR_GOOGLE_MAPS_KEY
     ```
   - Update `android/app/src/main/res/values/google_maps_api.xml` with the same maps key so Google Maps works on Android. (iOS uses Apple Maps by default and does not require this key.)

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
   npm test
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

### Key Technical Decisions
- **State management**: Redux Toolkit stores global filters and favorites. Favorites are persisted via MMKV using RTK listener middleware to keep reducers pure.
- **Data fetching & caching**: RTK Query handles Ticketmaster requests, pagination, caching, and loading/error states. Transform functions normalize the remote payload into lightweight `EventSummary` and `EventDetail` shapes shared throughout the UI.
- **Navigation**: Root native stack wraps a bottom tab navigator (Explore + Favorites). Tapping any card pushes an Event Details screen.
- **Offline favorites**: MMKV keeps a record map keyed by event id so cards and the details screen can render without refetching.
- **Maps & tickets**: `react-native-maps` renders venue coordinates (with graceful fallbacks) and the details screen exposes the purchase URL using the `Linking` API.

## Notes & Next Steps

- Replace the placeholder Google Maps API key in `android/app/src/main/res/values/google_maps_api.xml` before shipping.
- Ticketmaster rate limits apply; errors are surfaced via user-friendly banners and retry actions.
- Consider adding automated screenshots or a short demo video for submission as requested in the test instructions.

Happy building!
