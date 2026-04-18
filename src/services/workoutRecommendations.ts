import { UserProfile, RecommendedWorkout, FitnessGoal, FitnessLevel } from '../types';
import { RECOMMENDED_WORKOUTS } from '../constants/workouts';

export function getRecommendedWorkouts(
  profile: UserProfile,
  limit: number = 5
): RecommendedWorkout[] {
  const { goals, fitnessLevel } = profile;

  const scored = RECOMMENDED_WORKOUTS.map((workout) => {
    let score = 0;

    // Score by goal overlap
    const goalMatches = workout.targetGoals.filter((g) => goals.includes(g as FitnessGoal)).length;
    score += goalMatches * 10;

    // Score by difficulty match
    if (workout.difficulty === fitnessLevel) {
      score += 5;
    } else if (
      (fitnessLevel === 'intermediate' && workout.difficulty === 'beginner') ||
      (fitnessLevel === 'advanced' && workout.difficulty !== 'advanced')
    ) {
      score += 2;
    }

    return { workout, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ workout }) => workout);
}

export function getDailyWorkoutRecommendation(
  profile: UserProfile
): RecommendedWorkout | null {
  const recommendations = getRecommendedWorkouts(profile, 10);
  if (recommendations.length === 0) return null;

  // Use the day of year to cycle through recommendations deterministically
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return recommendations[dayOfYear % recommendations.length];
}

export function filterWorkoutsByGoal(
  goal: FitnessGoal
): RecommendedWorkout[] {
  return RECOMMENDED_WORKOUTS.filter((w) =>
    w.targetGoals.includes(goal)
  );
}

export function filterWorkoutsByDifficulty(
  level: FitnessLevel
): RecommendedWorkout[] {
  return RECOMMENDED_WORKOUTS.filter((w) => w.difficulty === level);
}

export function estimateCaloriesBurned(
  weightKg: number,
  durationMinutes: number,
  category: string
): number {
  // MET values per workout category (approximate)
  const metValues: Record<string, number> = {
    strength: 5.0,
    cardio: 7.0,
    running: 9.8,
    cycling: 7.5,
    yoga: 3.0,
    hiit: 10.0,
    flexibility: 2.5,
    swimming: 8.0,
    other: 5.0,
  };

  const met = metValues[category] ?? 5.0;
  // Calories = MET × weight(kg) × duration(hours)
  return Math.round(met * weightKg * (durationMinutes / 60));
}

export function getWorkoutProgressInsight(
  logs: { category: string; durationMinutes: number }[],
  goals: FitnessGoal[]
): string {
  if (logs.length === 0) {
    return "Log your first workout to start tracking your progress!";
  }

  const totalMinutes = logs.reduce((sum, l) => sum + l.durationMinutes, 0);
  const workoutsThisWeek = logs.length;

  if (goals.includes('lose-weight') || goals.includes('improve-health')) {
    if (workoutsThisWeek >= 4) return `Great work! ${workoutsThisWeek} workouts this week. Keep up the momentum!`;
    if (workoutsThisWeek >= 2) return `Good progress! Aim for 4+ workouts per week to reach your goal faster.`;
    return 'Try to get at least 3 workouts in this week. Every session counts!';
  }

  if (goals.includes('build-muscle') || goals.includes('get-stronger')) {
    const strengthSessions = logs.filter((l) => l.category === 'strength').length;
    if (strengthSessions >= 3) return `Solid strength training week with ${strengthSessions} sessions!`;
    return 'Add more strength training sessions to build muscle effectively.';
  }

  if (goals.includes('run-5k') || goals.includes('train-marathon')) {
    const runningSessions = logs.filter((l) => l.category === 'running').length;
    if (runningSessions >= 3) return `${runningSessions} runs this week — you're building great endurance!`;
    return 'Consistency is key for running goals. Aim for 3+ runs per week.';
  }

  return `${workoutsThisWeek} workouts logged this week, totaling ${totalMinutes} minutes. Keep it up!`;
}
