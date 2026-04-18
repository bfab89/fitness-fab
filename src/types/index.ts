export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type HeightUnit = 'imperial' | 'metric';
export type WeightUnit = 'lbs' | 'kg';

export type FitnessGoal =
  | 'lose-weight'
  | 'build-muscle'
  | 'run-5k'
  | 'improve-endurance'
  | 'get-stronger'
  | 'improve-flexibility'
  | 'train-marathon'
  | 'improve-health';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  fitnessLevel: FitnessLevel;
  goals: FitnessGoal[];
  onboardingComplete: boolean;
}

export type WorkoutCategory =
  | 'strength'
  | 'cardio'
  | 'running'
  | 'cycling'
  | 'yoga'
  | 'hiit'
  | 'flexibility'
  | 'swimming'
  | 'other';

export interface Exercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  weightKg?: number;
  distanceKm?: number;
}

export interface WorkoutLog {
  id: string;
  date: string;
  title: string;
  category: WorkoutCategory;
  durationMinutes: number;
  caloriesBurned?: number;
  exercises: Exercise[];
  notes?: string;
  source?: 'manual' | 'peloton' | 'apple-health' | 'apple-fitness';
}

export interface RecommendedWorkout {
  id: string;
  title: string;
  category: WorkoutCategory;
  durationMinutes: number;
  difficulty: FitnessLevel;
  description: string;
  exercises: Exercise[];
  targetGoals: FitnessGoal[];
  source?: 'built-in' | 'peloton';
  pelotonId?: string;
}

export interface MealGuidance {
  name: string;
  timing: string;
  calories: number;
  description: string;
  foods: string[];
}

export interface NutritionGuidance {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  waterLiters: number;
  meals: MealGuidance[];
  tips: string[];
}

export type ConnectedService =
  | 'peloton'
  | 'apple-health'
  | 'apple-fitness'
  | 'mynetdiary';

export interface ServiceConnection {
  service: ConnectedService;
  connected: boolean;
  lastSync?: string;
  username?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  ProfileSetup: undefined;
  GoalsSetup: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  WorkoutsTab: undefined;
  Nutrition: undefined;
  Profile: undefined;
};

export type WorkoutsStackParamList = {
  WorkoutsList: undefined;
  WorkoutDetail: { workoutId: string };
  LogWorkout: undefined;
  WorkoutRecommendations: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ConnectedServices: undefined;
};
