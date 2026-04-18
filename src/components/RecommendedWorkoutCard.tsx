import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RecommendedWorkout } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow, CategoryColors } from '../constants/theme';
import { CATEGORY_LABELS } from '../constants/workouts';

interface Props {
  workout: RecommendedWorkout;
  onPress?: () => void;
  compact?: boolean;
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

const DIFFICULTY_COLORS = {
  beginner: Colors.success,
  intermediate: Colors.warning,
  advanced: Colors.error,
};

export default function RecommendedWorkoutCard({ workout, onPress, compact = false }: Props) {
  const icon = CATEGORY_ICONS[workout.category] ?? 'fitness';
  const categoryColor = CategoryColors[workout.category] ?? Colors.primary;
  const difficultyColor = DIFFICULTY_COLORS[workout.difficulty];

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={onPress} activeOpacity={0.85}>
        <View style={[styles.compactIcon, { backgroundColor: `${categoryColor}20` }]}>
          <Ionicons name={icon} size={20} color={categoryColor} />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={1}>{workout.title}</Text>
          <Text style={styles.compactMeta}>{workout.durationMinutes} min · {CATEGORY_LABELS[workout.category]}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={[categoryColor, `${categoryColor}CC`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.categoryBadge}>
            <Ionicons name={icon} size={16} color={Colors.white} />
            <Text style={styles.categoryText}>{CATEGORY_LABELS[workout.category]}</Text>
          </View>
          {workout.source === 'peloton' && (
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceText}>PELOTON</Text>
            </View>
          )}
        </View>
        <Text style={styles.title}>{workout.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.metaText}>{workout.durationMinutes} min</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
            <Text style={styles.difficultyText}>{workout.difficulty}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        <Text style={styles.description} numberOfLines={2}>{workout.description}</Text>
        <View style={styles.exercisesRow}>
          <Ionicons name="list-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.exercisesText}>{workout.exercises.length} exercises</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginVertical: Spacing.sm,
    ...Shadow.md,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  categoryText: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
  sourceBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  sourceText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  difficultyText: {
    fontSize: FontSize.xs,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
    textTransform: 'capitalize',
  },
  body: {
    padding: Spacing.md,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  exercisesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exercisesText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    ...Shadow.sm,
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  compactMeta: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
