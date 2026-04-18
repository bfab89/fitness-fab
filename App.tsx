import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userReducer from './src/store/userSlice';
import workoutReducer from './src/store/workoutSlice';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors } from './src/constants/theme';

const STORAGE_KEY = 'fitnessfab_state';

const rootReducer = combineReducers({
  user: userReducer,
  workouts: workoutReducer,
});

export default function App() {
  const [store, setStore] = useState<ReturnType<typeof configureStore> | null>(null);

  useEffect(() => {
    async function init() {
      let preloadedState;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) preloadedState = JSON.parse(raw);
      } catch {}

      const s = configureStore({ reducer: rootReducer, preloadedState });
      s.subscribe(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(s.getState())).catch(() => {});
      });
      setStore(s);
    }
    init();
  }, []);

  if (!store) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store as any}>
          <StatusBar style="auto" />
          <AppNavigator />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
