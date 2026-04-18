import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList, FitnessGoal } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';
import { useAppDispatch } from '../../store/hooks';
import { updateProfile, completeOnboarding } from '../../store/userSlice';
import GoalCard from '../../components/GoalCard';
import { ALL_GOALS } from '../../constants/workouts';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'GoalsSetup'>;
};

export default function GoalsSetupScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [selectedGoals, setSelectedGoals] = useState<FitnessGoal[]>([]);

  function toggleGoal(goal: FitnessGoal) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  function handleFinish() {
    if (selectedGoals.length === 0) {
      Alert.alert('Select Goals', 'Please select at least one fitness goal to continue.');
      return;
    }
    dispatch(updateProfile({ goals: selectedGoals }));
    dispatch(completeOnboarding());
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.progress} />
        </View>
        <Text style={styles.stepText}>Step 2 of 2</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What are your goals?</Text>
        <Text style={styles.subtitle}>
          Select all that apply — we'll customize your workouts and nutrition plan accordingly
        </Text>

        {selectedGoals.length > 0 && (
          <View style={styles.selectionBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
            <Text style={styles.selectionText}>
              {selectedGoals.length} goal{selectedGoals.length > 1 ? 's' : ''} selected
            </Text>
          </View>
        )}

        {ALL_GOALS.map((goal) => (
          <GoalCard
            key={goal}
            goal={goal}
            selected={selectedGoals.includes(goal)}
            onPress={() => toggleGoal(goal)}
          />
        ))}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.finishBtn, selectedGoals.length === 0 && styles.finishBtnDisabled]}
          onPress={handleFinish}
          activeOpacity={0.9}
          disabled={selectedGoals.length === 0}
        >
          <LinearGradient
            colors={selectedGoals.length > 0
              ? [Colors.primary, Colors.primaryDark]
              : [Colors.border, Colors.border]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.finishBtnGradient}
          >
            <Text style={styles.finishBtnText}>Start My Journey</Text>
            <Ionicons name="rocket-outline" size={20} color={Colors.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, gap: Spacing.sm },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  progressBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2 },
  progress: { height: 4, borderRadius: 2, width: '100%' },
  stepText: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },
  scroll: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22, marginBottom: Spacing.lg },
  selectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${Colors.primary}12`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  selectionText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  footer: { padding: Spacing.xl },
  finishBtn: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  finishBtnDisabled: { opacity: 0.6 },
  finishBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  finishBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
});
