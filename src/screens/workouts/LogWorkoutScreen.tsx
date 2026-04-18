import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { WorkoutsStackParamList, WorkoutCategory, Exercise } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addWorkoutLog } from '../../store/workoutSlice';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { CATEGORY_LABELS } from '../../constants/workouts';
import { estimateCaloriesBurned } from '../../services/workoutRecommendations';

type Props = {
  navigation: NativeStackNavigationProp<WorkoutsStackParamList, 'LogWorkout'>;
};

const CATEGORIES: WorkoutCategory[] = [
  'strength', 'cardio', 'running', 'cycling', 'hiit', 'yoga', 'flexibility', 'swimming', 'other',
];

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

interface ExerciseFormState {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weightKg: string;
  durationSeconds: string;
  distanceKm: string;
}

function newExerciseState(): ExerciseFormState {
  return { id: generateId(), name: '', sets: '', reps: '', weightKg: '', durationSeconds: '', distanceKm: '' };
}

export default function LogWorkoutScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.user.profile);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkoutCategory>('strength');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<ExerciseFormState[]>([newExerciseState()]);

  function estimateCalories() {
    if (!profile || !duration) return;
    const est = estimateCaloriesBurned(profile.weightKg, Number(duration), category);
    setCalories(String(est));
  }

  function updateExercise(index: number, field: keyof ExerciseFormState, value: string) {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addExercise() { setExercises((prev) => [...prev, newExerciseState()]); }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!title.trim()) { Alert.alert('Missing Info', 'Please enter a workout title.'); return; }
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid duration in minutes.'); return;
    }

    const parsedExercises: Exercise[] = exercises
      .filter((e) => e.name.trim())
      .map((e) => ({
        id: e.id,
        name: e.name.trim(),
        sets: e.sets ? Number(e.sets) : undefined,
        reps: e.reps ? Number(e.reps) : undefined,
        weightKg: e.weightKg ? Number(e.weightKg) : undefined,
        durationSeconds: e.durationSeconds ? Number(e.durationSeconds) : undefined,
        distanceKm: e.distanceKm ? Number(e.distanceKm) : undefined,
      }));

    dispatch(
      addWorkoutLog({
        id: generateId(),
        date: new Date().toISOString(),
        title: title.trim(),
        category,
        durationMinutes: Number(duration),
        caloriesBurned: calories ? Number(calories) : undefined,
        exercises: parsedExercises,
        notes: notes.trim() || undefined,
        source: 'manual',
      })
    );
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Workout Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Workout Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Morning Push Day"
              placeholderTextColor={Colors.textLight}
              autoCapitalize="words"
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, category === cat && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Duration & Calories */}
          <View style={styles.row}>
            <View style={[styles.section, { flex: 1, marginRight: Spacing.md }]}>
              <Text style={styles.label}>Duration (min) *</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                placeholder="45"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <View style={styles.caloriesHeader}>
                <Text style={styles.label}>Calories</Text>
                {duration ? (
                  <TouchableOpacity onPress={estimateCalories}>
                    <Text style={styles.estimateBtn}>Estimate</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <TextInput
                style={styles.input}
                value={calories}
                onChangeText={setCalories}
                placeholder="320"
                placeholderTextColor={Colors.textLight}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Exercises */}
          <View style={styles.section}>
            <Text style={styles.label}>Exercises</Text>
            {exercises.map((ex, index) => (
              <View key={ex.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseNum}>Exercise {index + 1}</Text>
                  {exercises.length > 1 && (
                    <TouchableOpacity onPress={() => removeExercise(index)}>
                      <Ionicons name="close-circle" size={20} color={Colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={[styles.input, styles.exerciseNameInput]}
                  value={ex.name}
                  onChangeText={(v) => updateExercise(index, 'name', v)}
                  placeholder="Exercise name (e.g. Bench Press)"
                  placeholderTextColor={Colors.textLight}
                  autoCapitalize="words"
                />
                <View style={styles.exerciseRow}>
                  <TextInput
                    style={[styles.input, styles.exerciseMini]}
                    value={ex.sets}
                    onChangeText={(v) => updateExercise(index, 'sets', v)}
                    placeholder="Sets"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.exerciseMini]}
                    value={ex.reps}
                    onChangeText={(v) => updateExercise(index, 'reps', v)}
                    placeholder="Reps"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.exerciseMini]}
                    value={ex.weightKg}
                    onChangeText={(v) => updateExercise(index, 'weightKg', v)}
                    placeholder="kg"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.exerciseRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: Spacing.sm }]}
                    value={ex.durationSeconds}
                    onChangeText={(v) => updateExercise(index, 'durationSeconds', v)}
                    placeholder="Duration (sec)"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={ex.distanceKm}
                    onChangeText={(v) => updateExercise(index, 'distanceKm', v)}
                    placeholder="Distance (km)"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addExerciseBtn} onPress={addExercise}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.addExerciseText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="How did it go? Any PRs?"
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.white} />
            <Text style={styles.saveBtnText}>Save Workout</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.xl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.xl },
  section: { marginBottom: Spacing.xl },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  notesInput: { height: 100, textAlignVertical: 'top', paddingTop: Spacing.md },
  row: { flexDirection: 'row' },
  caloriesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  estimateBtn: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold },
  categoryRow: { gap: Spacing.sm },
  catChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  catTextActive: { color: Colors.white },
  exerciseCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  exerciseNum: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.primary },
  exerciseNameInput: { marginBottom: Spacing.sm },
  exerciseRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  exerciseMini: { flex: 1 },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
  },
  addExerciseText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.lg,
    ...Shadow.md,
  },
  saveBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
});
