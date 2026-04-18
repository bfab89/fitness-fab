# FitnessFab — Setup Guide

## Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android emulator, or the Expo Go app on your phone

## Getting Started

```bash
cd fitness-fab
npm install
npm start          # starts Expo dev server
```

Scan the QR code with Expo Go (iOS/Android) or press `i` for iOS simulator / `a` for Android.

---

## OAuth Configuration

### MyNetDiary

1. Register at https://www.mynetdiary.com/api.html
2. Set your client credentials as environment variables:
   ```bash
   export EXPO_PUBLIC_MND_CLIENT_ID=your_client_id
   export EXPO_PUBLIC_MND_CLIENT_SECRET=your_client_secret
   ```
3. Add `fitnessfab://` as a redirect URI in the MyNetDiary developer portal.

### Peloton

Peloton uses session-based authentication (username + password). No API key is required.
Users log in directly within the app. Their session token is stored securely via `expo-secure-store`.

### Apple Health & Apple Fitness+

Apple Health requires native HealthKit access, which is **not available in Expo Go or managed workflow**.

To enable it:
1. Run `npx expo eject` to switch to bare workflow
2. Install `react-native-health`: `npm install react-native-health`
3. Follow the [react-native-health setup](https://github.com/agencyenterprise/react-native-health) for iOS entitlements
4. Replace the stub implementations in `src/services/oauth/appleHealth.ts` with real HealthKit calls

The app handles the iOS-only limitation gracefully — the Apple Health/Fitness options show a clear message on Android.

---

## Architecture

```
src/
├── components/        # Reusable UI components
├── constants/         # Theme, workouts data, nutrition data
├── navigation/        # React Navigation stack & tab navigators
├── screens/
│   ├── onboarding/    # Welcome, ProfileSetup, GoalsSetup
│   ├── main/          # Dashboard, Workouts, Nutrition, Profile
│   ├── workouts/      # WorkoutDetail, LogWorkout, Recommendations
│   └── settings/      # ConnectedServices
├── services/
│   ├── oauth/         # Peloton, Apple Health, MyNetDiary integrations
│   ├── nutritionGuidance.ts   # Calorie & macro calculations (Mifflin-St Jeor)
│   └── workoutRecommendations.ts  # Goal-based workout matching
├── store/             # Redux Toolkit + redux-persist
│   ├── userSlice.ts   # Profile & service connections
│   └── workoutSlice.ts # Workout logs
└── types/             # TypeScript types
```

## Key Features

| Feature | Implementation |
|---|---|
| User profile | Redux Toolkit + AsyncStorage persistence |
| Workout logging | Manual entry with category, exercises, calories |
| Workout recommendations | Goal + fitness-level scoring against 10 built-in workouts |
| Nutrition guidance | Mifflin-St Jeor BMR + goal-based macro ratios |
| Peloton sync | Session-based auth via Peloton's internal API |
| Apple Health | HealthKit (bare workflow only) |
| MyNetDiary | OAuth2 via expo-auth-session with PKCE |
| Data persistence | redux-persist + AsyncStorage |
| Secure token storage | expo-secure-store |
