import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppSelector } from '../../store/hooks';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { calculateNutritionGuidance, getHydrationReminder, getGoalNutritionHeadline } from '../../services/nutritionGuidance';
import { GOAL_LABELS } from '../../constants/workouts';

function MacroBar({ label, grams, calories, color, total }: { label: string; grams: number; calories: number; color: string; total: number }) {
  const pct = Math.min((grams * (label === 'Fat' ? 9 : 4) / total) * 100, 100);
  return (
    <View style={macroStyles.container}>
      <View style={macroStyles.header}>
        <Text style={macroStyles.label}>{label}</Text>
        <Text style={macroStyles.grams}>{grams}g</Text>
      </View>
      <View style={macroStyles.bar}>
        <View style={[macroStyles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={macroStyles.calories}>{calories} cal</Text>
    </View>
  );
}

const macroStyles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text },
  grams: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text },
  bar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  fill: { height: '100%', borderRadius: 4 },
  calories: { fontSize: FontSize.xs, color: Colors.textSecondary },
});

export default function NutritionScreen() {
  const profile = useAppSelector((s) => s.user.profile);

  const guidance = useMemo(() =>
    profile ? calculateNutritionGuidance(profile) : null, [profile]);

  if (!profile || !guidance) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Ionicons name="nutrition-outline" size={60} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Complete your profile</Text>
          <Text style={styles.emptySubtitle}>Your nutrition guidance will appear here once you set up your profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const primaryGoal = profile.goals[0];
  const headline = primaryGoal ? getGoalNutritionHeadline(primaryGoal) : 'Your Nutrition Plan';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.accent, Colors.accentDark]} style={styles.hero}>
          <Text style={styles.heroLabel}>Nutrition Guidance</Text>
          <Text style={styles.heroTitle}>{headline}</Text>
          <View style={styles.calorieCircle}>
            <Text style={styles.calorieValue}>{guidance.dailyCalories}</Text>
            <Text style={styles.calorieUnit}>cal/day</Text>
          </View>
          {primaryGoal && (
            <View style={styles.goalBadge}>
              <Text style={styles.goalBadgeText}>Goal: {GOAL_LABELS[primaryGoal]}</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.content}>
          {/* Macros */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daily Macronutrients</Text>
            <MacroBar
              label="Protein"
              grams={guidance.proteinGrams}
              calories={guidance.proteinGrams * 4}
              color="#FF6B35"
              total={guidance.dailyCalories}
            />
            <MacroBar
              label="Carbohydrates"
              grams={guidance.carbsGrams}
              calories={guidance.carbsGrams * 4}
              color="#4ECDC4"
              total={guidance.dailyCalories}
            />
            <MacroBar
              label="Fat"
              grams={guidance.fatGrams}
              calories={guidance.fatGrams * 9}
              color="#FFC107"
              total={guidance.dailyCalories}
            />
            <View style={styles.fiberRow}>
              <Ionicons name="leaf-outline" size={16} color={Colors.success} />
              <Text style={styles.fiberText}>Fiber target: {guidance.fiberGrams}g/day</Text>
            </View>
          </View>

          {/* Hydration */}
          <View style={[styles.card, styles.hydrationCard]}>
            <View style={styles.hydrationHeader}>
              <Ionicons name="water" size={22} color="#45B7D1" />
              <Text style={styles.cardTitle}>Hydration Goal</Text>
            </View>
            <Text style={styles.hydrationValue}>{guidance.waterLiters}L</Text>
            <Text style={styles.hydrationHint}>{getHydrationReminder(guidance.waterLiters)}</Text>
          </View>

          {/* Meal Plan */}
          <Text style={styles.sectionTitle}>Meal Timing Guide</Text>
          {guidance.meals.map((meal, i) => (
            <View key={i} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <View style={styles.mealCalBadge}>
                  <Text style={styles.mealCalText}>{meal.calories} cal</Text>
                </View>
              </View>
              <Text style={styles.mealTiming}>
                <Ionicons name="time-outline" size={12} color={Colors.textSecondary} /> {meal.timing}
              </Text>
              <Text style={styles.mealDescription}>{meal.description}</Text>
              <View style={styles.foodList}>
                {meal.foods.slice(0, 2).map((food, j) => (
                  <View key={j} style={styles.foodItem}>
                    <View style={styles.foodDot} />
                    <Text style={styles.foodText}>{food}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Nutrition Tips */}
          <Text style={styles.sectionTitle}>Nutrition Tips</Text>
          <View style={styles.card}>
            {guidance.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textLight} />
            <Text style={styles.disclaimerText}>
              These recommendations are general guidelines based on your profile. Consult a registered dietitian for personalized medical nutrition advice.
            </Text>
          </View>

          <View style={{ height: Spacing.xl }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  heroLabel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginBottom: Spacing.xs },
  heroTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.white, textAlign: 'center', marginBottom: Spacing.lg },
  calorieCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  calorieValue: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.white },
  calorieUnit: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)' },
  goalBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  goalBadgeText: { fontSize: FontSize.sm, color: Colors.white, fontWeight: FontWeight.medium },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  fiberRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  fiberText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  hydrationCard: {},
  hydrationHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  hydrationValue: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: '#45B7D1', marginBottom: Spacing.xs },
  hydrationHint: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  mealCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  mealName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  mealCalBadge: { backgroundColor: `${Colors.accent}20`, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  mealCalText: { fontSize: FontSize.xs, color: Colors.accent, fontWeight: FontWeight.semibold },
  mealTiming: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.sm },
  mealDescription: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  foodList: { gap: 4 },
  foodItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  foodDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.accent },
  foodText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
  tipNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: `${Colors.accent}20`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tipNumberText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.accent },
  tipText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  disclaimer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    alignItems: 'flex-start',
  },
  disclaimerText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing.lg },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 },
});
