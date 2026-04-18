import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, FlatList, TouchableOpacity, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { addWorkoutLog } from '../../store/workoutSlice';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';
import { RECOMMENDED_WORKOUTS, GOAL_LABELS, CATEGORY_LABELS, FITNESS_LEVELS } from '../../constants/workouts';
import { RecommendedWorkout, FitnessLevel, FitnessGoal } from '../../types';
import RecommendedWorkoutCard from '../../components/RecommendedWorkoutCard';
import { getRecommendedWorkouts, estimateCaloriesBurned } from '../../services/workoutRecommendations';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export default function WorkoutRecommendationsScreen() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.user.profile);
  const pelotonConnection = useAppSelector((s) =>
    s.user.connections.find((c) => c.service === 'peloton')
  );

  const [selectedDifficulty, setSelectedDifficulty] = useState<FitnessLevel | 'all'>('all');
  const [selectedGoal, setSelectedGoal] = useState<FitnessGoal | 'all'>('all');
  const [detailWorkout, setDetailWorkout] = useState<RecommendedWorkout | null>(null);

  const personalized = useMemo(() =>
    profile ? getRecommendedWorkouts(profile, 5) : [], [profile]);

  const filtered = useMemo(() => {
    return RECOMMENDED_WORKOUTS.filter((w) => {
      const matchDiff = selectedDifficulty === 'all' || w.difficulty === selectedDifficulty;
      const matchGoal = selectedGoal === 'all' || w.targetGoals.includes(selectedGoal as FitnessGoal);
      return matchDiff && matchGoal;
    });
  }, [selectedDifficulty, selectedGoal]);

  function handleStartWorkout(workout: RecommendedWorkout) {
    if (!profile) return;
    dispatch(
      addWorkoutLog({
        id: generateId(),
        date: new Date().toISOString(),
        title: workout.title,
        category: workout.category,
        durationMinutes: workout.durationMinutes,
        caloriesBurned: estimateCaloriesBurned(profile.weightKg, workout.durationMinutes, workout.category),
        exercises: workout.exercises,
        notes: workout.description,
        source: workout.source === 'peloton' ? 'peloton' : 'manual',
      })
    );
    setDetailWorkout(null);
  }

  const goals: { value: FitnessGoal | 'all'; label: string }[] = [
    { value: 'all', label: 'All Goals' },
    ...Object.entries(GOAL_LABELS).map(([k, v]) => ({ value: k as FitnessGoal, label: v })),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Personalized Section */}
        {personalized.length > 0 && profile && (
          <View style={styles.section}>
            <LinearGradient colors={[Colors.secondary, '#16213E']} style={styles.personalizedHeader}>
              <Text style={styles.personalizedLabel}>Recommended For You</Text>
              <Text style={styles.personalizedSub}>Based on your goals and fitness level</Text>
            </LinearGradient>
            <View style={styles.personalizedList}>
              {personalized.slice(0, 3).map((w) => (
                <RecommendedWorkoutCard
                  key={w.id}
                  workout={w}
                  compact
                  onPress={() => setDetailWorkout(w)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Filters */}
        <View style={styles.section}>
          <Text style={styles.filterLabel}>Difficulty</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {(['all', ...FITNESS_LEVELS] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.chip, selectedDifficulty === level && styles.chipActive]}
                onPress={() => setSelectedDifficulty(level)}
              >
                <Text style={[styles.chipText, selectedDifficulty === level && styles.chipTextActive]}>
                  {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.filterLabel, { marginTop: Spacing.md }]}>Goal</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {goals.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.chip, selectedGoal === g.value && styles.chipActive]}
                onPress={() => setSelectedGoal(g.value)}
              >
                <Text style={[styles.chipText, selectedGoal === g.value && styles.chipTextActive]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* All Workouts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {filtered.length} workout{filtered.length !== 1 ? 's' : ''}
          </Text>
          {filtered.map((w) => (
            <RecommendedWorkoutCard
              key={w.id}
              workout={w}
              onPress={() => setDetailWorkout(w)}
            />
          ))}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Workout Detail Modal */}
      <Modal
        visible={!!detailWorkout}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailWorkout(null)}
      >
        {detailWorkout && (
          <SafeAreaView style={styles.modal}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setDetailWorkout(null)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Workout Details</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.detailTitle}>{detailWorkout.title}</Text>
              <View style={styles.detailMeta}>
                <View style={styles.metaBadge}>
                  <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{detailWorkout.durationMinutes} min</Text>
                </View>
                <View style={styles.metaBadge}>
                  <Ionicons name="fitness-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{CATEGORY_LABELS[detailWorkout.category]}</Text>
                </View>
                <View style={[styles.metaBadge, {
                  backgroundColor: detailWorkout.difficulty === 'beginner' ? `${Colors.success}20` :
                    detailWorkout.difficulty === 'intermediate' ? `${Colors.warning}20` : `${Colors.error}20`
                }]}>
                  <Text style={[styles.metaText, {
                    color: detailWorkout.difficulty === 'beginner' ? Colors.success :
                      detailWorkout.difficulty === 'intermediate' ? Colors.warning : Colors.error
                  }]}>
                    {detailWorkout.difficulty}
                  </Text>
                </View>
              </View>

              <Text style={styles.detailDescription}>{detailWorkout.description}</Text>

              <Text style={styles.detailSectionTitle}>Exercises</Text>
              {detailWorkout.exercises.map((ex, i) => {
                const parts: string[] = [];
                if (ex.sets && ex.reps) parts.push(`${ex.sets}×${ex.reps}`);
                if (ex.weightKg) parts.push(`${ex.weightKg}kg`);
                if (ex.durationSeconds) parts.push(`${ex.durationSeconds}s`);
                if (ex.distanceKm) parts.push(`${ex.distanceKm}km`);
                return (
                  <View key={ex.id} style={styles.exerciseRow}>
                    <View style={styles.exNum}><Text style={styles.exNumText}>{i + 1}</Text></View>
                    <View style={styles.exContent}>
                      <Text style={styles.exName}>{ex.name}</Text>
                      {parts.length > 0 && <Text style={styles.exMeta}>{parts.join(' · ')}</Text>}
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => handleStartWorkout(detailWorkout)}
                activeOpacity={0.9}
              >
                <LinearGradient colors={[Colors.primary, Colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.startBtnGradient}>
                  <Ionicons name="play-circle" size={22} color={Colors.white} />
                  <Text style={styles.startBtnText}>Log This Workout</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ height: Spacing.xxl }} />
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  personalizedHeader: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  personalizedLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
  personalizedSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  personalizedList: {},
  filterLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.sm },
  filterRow: { gap: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  chipTextActive: { color: Colors.white },
  sectionTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  modalContent: { padding: Spacing.xl },
  detailTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  detailMeta: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  metaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.surfaceVariant, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: BorderRadius.full },
  metaText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium, textTransform: 'capitalize' },
  detailDescription: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 24, marginBottom: Spacing.xl },
  detailSectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  exNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: `${Colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  exNumText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  exContent: { flex: 1 },
  exName: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
  exMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  startBtn: { borderRadius: BorderRadius.full, overflow: 'hidden', marginTop: Spacing.xxl },
  startBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  startBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
});
