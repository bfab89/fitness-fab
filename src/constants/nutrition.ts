import { FitnessGoal, FitnessLevel } from '../types';

export const CALORIE_MULTIPLIERS: Record<FitnessLevel, number> = {
  beginner: 1.375,
  intermediate: 1.55,
  advanced: 1.725,
};

export const GOAL_CALORIE_ADJUSTMENTS: Record<string, number> = {
  'lose-weight': -500,
  'build-muscle': 300,
  'run-5k': 200,
  'improve-endurance': 200,
  'get-stronger': 200,
  'improve-flexibility': 0,
  'train-marathon': 400,
  'improve-health': 0,
};

export const MACRO_RATIOS: Record<string, { protein: number; carbs: number; fat: number }> = {
  'lose-weight': { protein: 0.35, carbs: 0.35, fat: 0.30 },
  'build-muscle': { protein: 0.30, carbs: 0.45, fat: 0.25 },
  'run-5k': { protein: 0.25, carbs: 0.50, fat: 0.25 },
  'improve-endurance': { protein: 0.25, carbs: 0.55, fat: 0.20 },
  'get-stronger': { protein: 0.35, carbs: 0.40, fat: 0.25 },
  'improve-flexibility': { protein: 0.25, carbs: 0.45, fat: 0.30 },
  'train-marathon': { protein: 0.20, carbs: 0.60, fat: 0.20 },
  'improve-health': { protein: 0.25, carbs: 0.50, fat: 0.25 },
};

export const NUTRITION_TIPS: Record<string, string[]> = {
  'lose-weight': [
    'Eat protein at every meal to preserve muscle and stay full longer',
    'Focus on whole, unprocessed foods that are high in volume and low in calories',
    'Drink water before meals to reduce appetite',
    'Track your food intake to stay within your calorie budget',
    'Prioritize sleep — poor sleep increases hunger hormones',
  ],
  'build-muscle': [
    'Consume 1.6–2.2g of protein per kg of bodyweight daily',
    'Eat a carb and protein-rich meal within 2 hours after training',
    'Don\'t fear carbohydrates — they fuel intense workouts and aid recovery',
    'Consider creatine monohydrate (5g/day) for strength and muscle gains',
    'Eat in a slight caloric surplus of 200–300 calories',
  ],
  'run-5k': [
    'Fuel long runs with complex carbohydrates 2–3 hours before',
    'Hydrate consistently throughout the day, not just before runs',
    'Replenish electrolytes after sweaty sessions with sodium-rich foods',
    'Recovery meals should include both protein and carbs',
    'Avoid high-fat or high-fiber meals immediately before running',
  ],
  'improve-endurance': [
    'Carbohydrates are your primary fuel for endurance exercise',
    'Practice eating and drinking during long workouts to train your gut',
    'Focus on iron-rich foods to support oxygen delivery to muscles',
    'Consume anti-inflammatory foods like berries and fatty fish to aid recovery',
    'Stay consistently hydrated throughout the day',
  ],
  'get-stronger': [
    'Protein timing matters — aim for 30–40g of protein per meal',
    'Pre-workout carbs provide energy for heavy lifting sessions',
    'Adequate calorie intake is essential to support strength gains',
    'Creatine and caffeine are two evidence-backed supplements for strength',
    'Post-workout nutrition within 45 minutes accelerates recovery',
  ],
  'improve-flexibility': [
    'Anti-inflammatory foods like turmeric and omega-3s support joint health',
    'Stay hydrated — dehydration reduces tissue elasticity',
    'Collagen from bone broth or supplements may support connective tissue',
    'Magnesium-rich foods (leafy greens, nuts) support muscle relaxation',
    'Avoid heavy meals before yoga or stretching sessions',
  ],
  'train-marathon': [
    'Practice your race-day nutrition on long training runs',
    'Carbohydrate loading 2–3 days before a long race increases glycogen stores',
    'Consume 30–60g of carbs per hour during runs over 90 minutes',
    'Prioritize sodium replacement during and after long runs',
    'Maintain a food diary to identify what works best for your digestion',
  ],
  'improve-health': [
    'Build your plate with half vegetables, a quarter protein, a quarter whole grains',
    'Eat a rainbow of colorful fruits and vegetables for diverse nutrients',
    'Limit ultra-processed foods and added sugars',
    'Prioritize sleep and stress management — both affect nutrition choices',
    'Practice mindful eating and avoid distractions while eating',
  ],
};

export const FOOD_GROUPS = {
  proteins: [
    'Chicken breast', 'Turkey', 'Salmon', 'Tuna', 'Eggs', 'Greek yogurt',
    'Cottage cheese', 'Lentils', 'Black beans', 'Tofu', 'Tempeh', 'Edamame',
  ],
  carbohydrates: [
    'Brown rice', 'Oatmeal', 'Sweet potato', 'Quinoa', 'Whole wheat bread',
    'Bananas', 'Apples', 'Blueberries', 'Whole grain pasta', 'Barley',
  ],
  fats: [
    'Avocado', 'Almonds', 'Walnuts', 'Olive oil', 'Chia seeds', 'Flaxseed',
    'Salmon', 'Sardines', 'Peanut butter', 'Coconut oil',
  ],
  vegetables: [
    'Spinach', 'Kale', 'Broccoli', 'Brussels sprouts', 'Bell peppers',
    'Cucumber', 'Zucchini', 'Asparagus', 'Green beans', 'Cauliflower',
  ],
};

export const MEAL_TEMPLATES = {
  breakfast: {
    name: 'Breakfast',
    timing: '7:00 – 9:00 AM',
    portionCalories: 0.25,
    description: 'Start the day with balanced macros to fuel morning activity',
    foods: ['Oatmeal with berries and protein powder', 'Eggs with whole grain toast', 'Greek yogurt parfait', 'Smoothie with protein'],
  },
  morningSnack: {
    name: 'Morning Snack',
    timing: '10:00 – 11:00 AM',
    portionCalories: 0.10,
    description: 'Bridge the gap between breakfast and lunch',
    foods: ['Apple with almond butter', 'Cottage cheese', 'Handful of mixed nuts', 'Protein bar'],
  },
  lunch: {
    name: 'Lunch',
    timing: '12:00 – 1:30 PM',
    portionCalories: 0.30,
    description: 'Your largest meal to sustain afternoon energy',
    foods: ['Grilled chicken with rice and vegetables', 'Quinoa power bowl', 'Turkey and avocado wrap', 'Lentil soup with bread'],
  },
  afternoonSnack: {
    name: 'Pre-Workout Snack',
    timing: '3:00 – 4:00 PM',
    portionCalories: 0.10,
    description: 'Fuel your workout with easily digestible carbs and protein',
    foods: ['Banana with peanut butter', 'Rice cakes with honey', 'Dates and almonds', 'Protein shake'],
  },
  dinner: {
    name: 'Dinner',
    timing: '6:00 – 8:00 PM',
    portionCalories: 0.25,
    description: 'Recovery-focused meal with protein and vegetables',
    foods: ['Salmon with roasted vegetables', 'Beef stir-fry with rice', 'Tofu and vegetable curry', 'Turkey meatballs with pasta'],
  },
};
