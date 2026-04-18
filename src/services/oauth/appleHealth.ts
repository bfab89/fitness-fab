import { Platform } from 'react-native';
import { WorkoutLog } from '../../types';

// Apple Health uses HealthKit, a native iOS framework — not OAuth2.
// Full integration requires either the bare Expo workflow with
// react-native-health, or a custom Expo config plugin.
//
// This module provides the service interface; in production, replace
// the stub implementations with real HealthKit calls after ejecting
// to bare workflow and installing react-native-health.

export const APPLE_HEALTH_AVAILABLE = Platform.OS === 'ios';

const HEALTH_PERMISSIONS = {
  read: [
    'ActiveEnergyBurned',
    'BasalEnergyBurned',
    'BodyMass',
    'BodyMassIndex',
    'Height',
    'HeartRate',
    'StepCount',
    'DistanceWalkingRunning',
    'Workout',
    'SleepAnalysis',
  ],
  write: ['Workout', 'ActiveEnergyBurned'],
};

export async function requestAppleHealthPermissions(): Promise<boolean> {
  if (!APPLE_HEALTH_AVAILABLE) {
    throw new Error('Apple Health is only available on iOS devices.');
  }

  // Production: use react-native-health
  // import AppleHealthKit from 'react-native-health';
  // return new Promise((resolve) => {
  //   AppleHealthKit.initHealthKit(HEALTH_PERMISSIONS, (err) => {
  //     resolve(!err);
  //   });
  // });

  // Stub for managed Expo workflow:
  return true;
}

export async function fetchAppleHealthWorkouts(
  startDate: Date,
  endDate: Date
): Promise<WorkoutLog[]> {
  if (!APPLE_HEALTH_AVAILABLE) return [];

  // Production:
  // import AppleHealthKit, { HealthValue } from 'react-native-health';
  // return new Promise((resolve) => {
  //   AppleHealthKit.getSamples({
  //     startDate: startDate.toISOString(),
  //     endDate: endDate.toISOString(),
  //     type: 'Workout',
  //   }, (err, results) => {
  //     if (err) return resolve([]);
  //     resolve(results.map(mapAppleWorkoutToLog));
  //   });
  // });

  // Stub — returns empty until HealthKit is wired in:
  return [];
}

export async function fetchAppleHealthMetrics(): Promise<{
  steps: number;
  activeCalories: number;
  restingHeartRate: number | null;
  weight: number | null;
} | null> {
  if (!APPLE_HEALTH_AVAILABLE) return null;

  // Production: query HealthKit for today's metrics
  // Stub:
  return {
    steps: 0,
    activeCalories: 0,
    restingHeartRate: null,
    weight: null,
  };
}

export async function writeWorkoutToAppleHealth(
  workout: WorkoutLog
): Promise<boolean> {
  if (!APPLE_HEALTH_AVAILABLE) return false;

  // Production:
  // import AppleHealthKit from 'react-native-health';
  // AppleHealthKit.saveWorkout({
  //   type: mapCategoryToHKWorkoutType(workout.category),
  //   startDate: workout.date,
  //   endDate: addMinutes(new Date(workout.date), workout.durationMinutes).toISOString(),
  //   energyBurned: workout.caloriesBurned,
  //   energyBurnedUnit: 'calorie',
  // }, (err) => !err);

  return true;
}

export async function fetchAppleFitnessWorkouts(
  startDate: Date,
  endDate: Date
): Promise<WorkoutLog[]> {
  // Apple Fitness+ workout content is accessed via HealthKit after
  // completing a workout. Same HealthKit permissions as Apple Health.
  return fetchAppleHealthWorkouts(startDate, endDate);
}

function mapCategoryToHKWorkoutType(category: string): string {
  const map: Record<string, string> = {
    strength: 'TraditionalStrengthTraining',
    cardio: 'Other',
    running: 'Running',
    cycling: 'Cycling',
    yoga: 'Yoga',
    hiit: 'HighIntensityIntervalTraining',
    flexibility: 'Flexibility',
    swimming: 'Swimming',
    other: 'Other',
  };
  return map[category] ?? 'Other';
}
