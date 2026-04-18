import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FitnessGoal } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow, GoalColors } from '../constants/theme';
import { GOAL_LABELS, GOAL_DESCRIPTIONS, GOAL_ICONS } from '../constants/workouts';

interface Props {
  goal: FitnessGoal;
  selected?: boolean;
  onPress?: () => void;
}

export default function GoalCard({ goal, selected = false, onPress }: Props) {
  const label = GOAL_LABELS[goal] ?? goal;
  const description = GOAL_DESCRIPTIONS[goal] ?? '';
  const iconName = GOAL_ICONS[goal] ?? 'fitness';
  const color = GoalColors[goal] ?? Colors.primary;

  return (
    <TouchableOpacity
      style={[styles.container, selected && { borderColor: color, borderWidth: 2 }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.iconBadge, { backgroundColor: `${color}20` }]}>
        <Ionicons name={iconName as any} size={24} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
      </View>
      {selected && (
        <View style={[styles.checkmark, { backgroundColor: color }]}>
          <Ionicons name="checkmark" size={14} color={Colors.white} />
        </View>
      )}
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
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: 3,
  },
  description: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
});
