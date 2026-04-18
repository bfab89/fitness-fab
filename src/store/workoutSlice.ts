import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkoutLog, WorkoutCategory } from '../types';

interface WorkoutState {
  logs: WorkoutLog[];
  activeWorkout: WorkoutLog | null;
}

const initialState: WorkoutState = {
  logs: [],
  activeWorkout: null,
};

const workoutSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    addWorkoutLog(state, action: PayloadAction<WorkoutLog>) {
      state.logs.unshift(action.payload);
    },
    updateWorkoutLog(state, action: PayloadAction<WorkoutLog>) {
      const index = state.logs.findIndex((l) => l.id === action.payload.id);
      if (index >= 0) {
        state.logs[index] = action.payload;
      }
    },
    deleteWorkoutLog(state, action: PayloadAction<string>) {
      state.logs = state.logs.filter((l) => l.id !== action.payload);
    },
    setActiveWorkout(state, action: PayloadAction<WorkoutLog | null>) {
      state.activeWorkout = action.payload;
    },
    importWorkouts(state, action: PayloadAction<WorkoutLog[]>) {
      const existingIds = new Set(state.logs.map((l) => l.id));
      const newLogs = action.payload.filter((l) => !existingIds.has(l.id));
      state.logs = [...newLogs, ...state.logs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
  },
});

export const {
  addWorkoutLog,
  updateWorkoutLog,
  deleteWorkoutLog,
  setActiveWorkout,
  importWorkouts,
} = workoutSlice.actions;

export default workoutSlice.reducer;

export const selectWorkoutsByCategory = (
  logs: WorkoutLog[],
  category: WorkoutCategory
) => logs.filter((l) => l.category === category);

export const selectRecentWorkouts = (logs: WorkoutLog[], days: number = 7) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return logs.filter((l) => new Date(l.date) >= cutoff);
};

export const selectWeeklyStats = (logs: WorkoutLog[]) => {
  const recent = selectRecentWorkouts(logs, 7);
  return {
    count: recent.length,
    totalMinutes: recent.reduce((sum, l) => sum + l.durationMinutes, 0),
    totalCalories: recent.reduce((sum, l) => sum + (l.caloriesBurned ?? 0), 0),
  };
};
