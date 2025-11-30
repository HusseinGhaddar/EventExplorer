# Event Explorer

Event Explorer is a React Native app that lets users search, browse, and save live events in any city using the Ticketmaster Discovery API.

It’s built with:

- React Native 0.76 (new architecture / bridgeless)
- TypeScript
- Redux Toolkit + RTK Query
- React Navigation (stack + tabs)
- MMKV for local storage

---

## Features

### Search & Explore

- Search events by **city**, **keyword**, or both.
- When both inputs are empty, the Explore screen shows a **suggested events feed**:
  - It picks a random popular city and fetches real events.
  - Inputs stay blank, so the user can still type their own city/keyword at any time.
- Uses the Ticketmaster `/events` endpoint with:
  - `keyword`
  - `city`
  - `page` and `size` for pagination
  - optional `classificationName` for basic category filtering

### List of upcoming events

The Explore screen shows a scrollable list (FlatList) with:

- Event **name**
- Formatted **date and time**
- Event **image** (or a styled placeholder if none is provided)
- **Venue** name and city
- **Category** (segment / genre combination)

Behavior:

- Infinite scroll (**load more on scroll**)
- Loading indicators while fetching data
- Empty state messaging when no results are found
- Error state with a retry action when network/API calls fail
- Pull-to-refresh support

### Event details

Tapping an event opens the Event Details screen with:

- Poster / hero image
- Event title, formatted date, and category badge
- Description with safe fallbacks if the API doesn’t provide one
- Additional info when available
- Venue name and full address
- Price ranges (if Ticketmaster returns them), formatted with currency
- A **“Buy tickets”** button that opens the event’s ticket URL in the browser

#### Google Maps integration

Location is handled using **Google Maps deep links** (no SDK, no static map images):

- If the venue has latitude/longitude, the app opens:
  - `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>`
- If only address/city is available, it opens:
  - `https://www.google.com/maps/search/?api=1&query=<encoded address>`

This gives the user the full Google Maps experience (directions, navigation, etc.) without extra native configuration or API keys.

The app **does not use an inline MapView or static map preview** on purpose:

- Keeps the setup simpler and more reliable.
- Avoids extra native dependencies and a Google Maps API key.
- Still provides a clean way to open the venue location.

### Favorites with local storage (MMKV)

- Events can be **favorited/unfavorited** from the Explore list and/or the details screen.
- A dedicated **Favorites** tab shows all saved events.
- Favorites are stored in Redux and persisted via **MMKV**:
  - `src/storage/mmkv.ts` handles serialization to/from MMKV.
  - A Redux listener middleware watches favorites actions and writes updates to storage.

### Theming and UX polish

- Theme selector with **auto / light / dark** modes, stored in Redux and persisted with MMKV.
- A small control on the Explore screen switches between:
  - System (auto)
  - Light
  - Dark
- Subtle animations on:
  - Event card presses
  - Favorite toggling
  - Transition into the details screen

---

## Tech Stack

- **React Native** 0.76 (new architecture / bridgeless)
- **TypeScript**
- **React Navigation** (stack navigator + bottom tab navigator)
- **Redux Toolkit**:
  - Store configuration
  - Slices for favorites, filters, and theme
- **RTK Query**:
  - Ticketmaster Discovery API client
  - Normalized event models (`EventSummary`, `EventDetail`)
  - Pagination, loading, and error handling
- **MMKV**:
  - Persistent storage for favorites and theme mode
- **Jest**:
  - Basic smoke test for the root `App` component

---

## Setup

### Prerequisites

- Node.js 18+
- React Native environment set up (Android SDK, Java, Android Studio, etc.)  
  Docs: <https://reactnative.dev/docs/environment-setup>

### 1. Install dependencies

```bash
npm install

Project structure

src/
  api/               # RTK Query service for Ticketmaster
  components/        # Event cards, state messages, reusable UI
  navigation/        # Root stack + bottom tab navigators
  screens/           # Explore, Favorites, EventDetails
  storage/           # MMKV helpers for favorites and theme
  store/             # Redux store, slices, and middleware
  theme/             # Color palettes + theme hook
  types/             # Shared TypeScript types (events, theme, env)

  Notes

Ticketmaster rate limits or partial data can result in empty or sparse results; the app shows appropriate loading, empty, and error states with retry actions.

When the search fields are empty, Explore shows a random city feed so users immediately see real events.

A short demo video can be linked here (unlisted) to show the full flow: suggested events → search → event details → Google Maps → tickets → favorites → theme toggle.
