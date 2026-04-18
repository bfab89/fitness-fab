import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { WorkoutsStackParamList, Exercise } from '../../types';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { deleteWorkoutLog } from '../../store/workoutSlice';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow, CategoryColors } from '../../constants/theme';
import { CATEGORY_LABELS } from '../../constants/workouts';

type Props = {
  navigation: NativeStackNavigationProp<WorkoutsStackParamList, 'WorkoutDetail'>;
  route: RouteProp<WorkoutsStackParamList, 'WorkoutDetail'>;
};

function ExerciseRow({ exercise, index }: { exercise: Exercise; index: number }) {
  const details: string[] = [];
  if (exercise.sets && exercise.reps) details.push(`${exercise.sets} × ${exercise.reps} reps`);
  else if (exercise.sets) details.push(`${exercise.sets} sets`);
  if (exercise.weightKg) details.push(`${exercise.weightKg} kg`);
  if (exercise.durationSeconds) {
    const m = Math.floor(exercise.durationSeconds / 60);
    const s = exercise.durationSeconds % 60;
    details.push(m > 0 ? `${m}m ${s > 0 ? s + 's' : ''}` : `${s}s`);
  }
  if (exercise.distanceKm) details.push(`${exercise.distanceKm} km`);

  return (
    <View style={exStyles.row}>
      <View style={exStyles.number}>
        <Text style={exStyles.numberText}>{index + 1}</Text>
      </View>
      <View style={exStyles.content}>
        <Text style={exStyles.name}>{exercise.name}</Text>
        {details.length > 0 && (
          <Text style={exStyles.details}>{details.join(' · ')}</Text>
        )}
      </View>
    </View>
  );
}

const exStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  number: { width: 28, height: 28, borderRadius: 14, backgroundColor: `${Colors.primary}15`, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  numberText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  content: { flex: 1 },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
  details: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
});

export default function WorkoutDetailScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const { workoutId } = route.params;
  const workout = useAppSelector((s) =>
    s.workouts.logs.find((l) => l.id === workoutId)
  );

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Workout not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoryColor = CategoryColors[workout.category] ?? Colors.primary;

  function handleDelete() {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteWorkoutLog(workoutId));
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category Banner */}
        <View style={[styles.banner, { backgroundColor: `${categoryColor}20` }]}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <Text style={styles.categoryText}>{CATEGORY_LABELS[workout.category]}</Text>
          </View>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
          <Text style={styles.workoutDate}>
            {format(new Date(workout.date), 'EEEE, MMMM d, yyyy · h:mm a')}
          </Text>
          {workout.source && workout.source !== 'manual' && (
            <View style={styles.sourceBadge}>
              <Ionicons name="link-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.sourceText}>via {workout.source}</Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={22} color={Colors.primary} />
            <Text style={styles.statValue}>{workout.durationMinutes}</Text>
            <Text style={styles.statLabel}>minutes</Text>
          </View>
          {workout.caloriesBurned != null && (
            <View style={styles.stat}>
              <Ionicons name="flame-outline" size={22} color={Colors.warning} />
              <Text style={styles.statValue}>{workout.caloriesBurned}</Text>
              <Text style={styles.statLabel}>calories</Text>
            </View>
          )}
          {workout.exercises.length > 0 && (
            <View style={styles.stat}>
              <Ionicons name="list-outline" size={22} color={Colors.accent} />
              <Text style={styles.statValue}>{workout.exercises.length}</Text>
              <Text style={styles.statLabel}>exercises</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Exercises */}
          {workout.exercises.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Exercises</Text>
              {workout.exercises.map((ex, i) => (
                <ExerciseRow key={ex.id} exercise={ex} index={i} />
              ))}
            </View>
          )}

          {/* Notes */}
          {workout.notes && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Notes</Text>
              <Text style={styles.notes}>{workout.notes}</Text>
            </View>
          )}

          {/* Delete */}
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.85}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Text style={styles.deleteBtnText}>Delete Workout</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.xl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: FontSize.lg, color: Colors.textSecondary },
  banner: { padding: Spacing.xl, paddingTop: Spacing.lg },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: BorderRadius.full, marginBottom: Spacing.sm },
  categoryText: { fontSize: FontSize.xs, color: Colors.white, fontWeight: FontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  workoutTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: 4 },
  workoutDate: { fontSize: FontSize.sm, color: Colors.textSecondary },
  sourceBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
  sourceText: { fontSize: FontSize.xs, color: Colors.textSecondary, textTransform: 'capitalize' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.surface, paddingVertical: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  stat: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  statLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  card: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadow.sm },
  cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  notes: { fontSize: FontSize.md, color: Colors.text, lineHeight: 22 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  deleteBtnText: { fontSize: FontSize.md, color: Colors.error, fontWeight: FontWeight.semibold },
});
