import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { WorkoutLog } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../constants/theme';
import { CATEGORY_LABELS } from '../constants/workouts';

interface Props {
  workout: WorkoutLog;
  onPress?: () => void;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  strength: 'barbell',
  cardio: 'heart',
  running: 'footsteps',
  cycling: 'bicycle',
  yoga: 'body',
  hiit: 'flash',
  flexibility: 'leaf',
  swimming: 'water',
  other: 'fitness',
};

export default function WorkoutCard({ workout, onPress }: Props) {
  const icon = CATEGORY_ICONS[workout.category] ?? 'fitness';
  const label = CATEGORY_LABELS[workout.category] ?? workout.category;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={Colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{workout.title}</Text>
        <Text style={styles.subtitle}>{label} · {format(new Date(workout.date), 'MMM d')}</Text>
      </View>
      <View style={styles.stats}>
        <Text style={styles.duration}>{workout.durationMinutes} min</Text>
        {workout.caloriesBurned != null && (
          <Text style={styles.calories}>{workout.caloriesBurned} kcal</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    ...Shadow.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  stats: {
    alignItems: 'flex-end',
  },
  duration: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  calories: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
