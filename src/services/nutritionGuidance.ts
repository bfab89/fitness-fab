import { UserProfile, NutritionGuidance, MealGuidance, FitnessGoal } from '../types';
import {
  CALORIE_MULTIPLIERS,
  GOAL_CALORIE_ADJUSTMENTS,
  MACRO_RATIOS,
  NUTRITION_TIPS,
  MEAL_TEMPLATES,
} from '../constants/nutrition';

function calculateBMR(profile: UserProfile): number {
  const { weightKg, heightCm, age, gender } = profile;

  // Mifflin-St Jeor equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

function getPrimaryGoal(goals: FitnessGoal[]): FitnessGoal {
  // Priority order for nutrition calculation
  const priority: FitnessGoal[] = [
    'lose-weight',
    'build-muscle',
    'train-marathon',
    'run-5k',
    'get-stronger',
    'improve-endurance',
    'improve-flexibility',
    'improve-health',
  ];

  for (const goal of priority) {
    if (goals.includes(goal)) return goal;
  }
  return 'improve-health';
}

export function calculateNutritionGuidance(profile: UserProfile): NutritionGuidance {
  const bmr = calculateBMR(profile);
  const tdee = bmr * CALORIE_MULTIPLIERS[profile.fitnessLevel];

  const primaryGoal = getPrimaryGoal(profile.goals);
  const calorieAdjustment = GOAL_CALORIE_ADJUSTMENTS[primaryGoal] ?? 0;
  const dailyCalories = Math.max(1200, Math.round(tdee + calorieAdjustment));

  const macros = MACRO_RATIOS[primaryGoal] ?? MACRO_RATIOS['improve-health'];
  const proteinGrams = Math.round((dailyCalories * macros.protein) / 4);
  const carbsGrams = Math.round((dailyCalories * macros.carbs) / 4);
  const fatGrams = Math.round((dailyCalories * macros.fat) / 9);
  const fiberGrams = Math.round(dailyCalories / 1000 * 14);
  const waterLiters = Math.round((profile.weightKg * 0.033 + (profile.fitnessLevel === 'advanced' ? 0.5 : 0.25)) * 10) / 10;

  const meals = buildMealPlan(dailyCalories, primaryGoal);
  const tips = NUTRITION_TIPS[primaryGoal] ?? NUTRITION_TIPS['improve-health'];

  return {
    dailyCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    fiberGrams,
    waterLiters,
    meals,
    tips,
  };
}

function buildMealPlan(dailyCalories: number, goal: FitnessGoal): MealGuidance[] {
  const templates = [
    MEAL_TEMPLATES.breakfast,
    MEAL_TEMPLATES.morningSnack,
    MEAL_TEMPLATES.lunch,
    MEAL_TEMPLATES.afternoonSnack,
    MEAL_TEMPLATES.dinner,
  ];

  return templates.map((t) => ({
    name: t.name,
    timing: t.timing,
    calories: Math.round(dailyCalories * t.portionCalories),
    description: t.description,
    foods: t.foods,
  }));
}

export function getHydrationReminder(waterLiters: number): string {
  const glasses = Math.round(waterLiters * 4);
  return `Aim for ${waterLiters}L (${glasses} glasses) of water per day. Start with a full glass every morning and keep a water bottle with you.`;
}

export function getMacroSummary(guidance: NutritionGuidance): string {
  return `Daily target: ${guidance.dailyCalories} cal · ${guidance.proteinGrams}g protein · ${guidance.carbsGrams}g carbs · ${guidance.fatGrams}g fat`;
}

export function getGoalNutritionHeadline(goal: FitnessGoal): string {
  const headlines: Record<string, string> = {
    'lose-weight': 'Fuel Your Fat Loss',
    'build-muscle': 'Eat to Build',
    'run-5k': 'Carbs Are Your Friend',
    'improve-endurance': 'Power Your Endurance',
    'get-stronger': 'Eat for Strength',
    'improve-flexibility': 'Nourish Your Joints',
    'train-marathon': 'Marathon Nutrition',
    'improve-health': 'Balanced & Healthy',
  };
  return headlines[goal] ?? 'Personalized Nutrition';
}
