import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { useAppSelector } from '../../store/hooks';
import { selectWeeklyStats, selectRecentWorkouts } from '../../store/workoutSlice';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { GOAL_LABELS } from '../../constants/workouts';
import MetricCard from '../../components/MetricCard';
import WorkoutCard from '../../components/WorkoutCard';
import RecommendedWorkoutCard from '../../components/RecommendedWorkoutCard';
import { getDailyWorkoutRecommendation } from '../../services/workoutRecommendations';
import { getWorkoutProgressInsight } from '../../services/workoutRecommendations';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const profile = useAppSelector((s) => s.user.profile);
  const logs = useAppSelector((s) => s.workouts.logs);
  const connections = useAppSelector((s) => s.user.connections);

  const weeklyStats = useMemo(() => selectWeeklyStats(logs), [logs]);
  const recentLogs = useMemo(() => selectRecentWorkouts(logs, 7), [logs]);
  const todayRecommendation = useMemo(() =>
    profile ? getDailyWorkoutRecommendation(profile) : null, [profile]);
  const insight = useMemo(() =>
    getWorkoutProgressInsight(recentLogs, profile?.goals ?? []), [recentLogs, profile]);

  const connectedCount = connections.filter((c) => c.connected).length;
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <LinearGradient
          colors={[Colors.secondary, '#16213E']}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>{greeting()},</Text>
              <Text style={styles.heroName}>{profile?.name ?? 'Athlete'} 👋</Text>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-circle-outline" size={32} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroDate}>{format(new Date(), 'EEEE, MMMM d')}</Text>

          {profile?.goals && profile.goals.length > 0 && (
            <View style={styles.goalBadge}>
              <Ionicons name="flag" size={12} color={Colors.primary} />
              <Text style={styles.goalBadgeText}>
                {profile.goals.slice(0, 2).map((g) => GOAL_LABELS[g]).join(' · ')}
              </Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.content}>
          {/* Weekly Stats */}
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.metricsRow}>
            <MetricCard
              label="Workouts"
              value={weeklyStats.count}
              icon="barbell"
              color={Colors.primary}
            />
            <MetricCard
              label="Minutes"
              value={weeklyStats.totalMinutes}
              icon="time"
              color={Colors.accent}
            />
            <MetricCard
              label="Calories"
              value={weeklyStats.totalCalories}
              icon="flame"
              color={Colors.warning}
            />
          </View>

          {/* Progress Insight */}
          <View style={styles.insightCard}>
            <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
            <Text style={styles.insightText}>{insight}</Text>
          </View>

          {/* Today's Recommendation */}
          {todayRecommendation && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Workout</Text>
                <TouchableOpacity onPress={() => navigation.navigate('WorkoutsTab', { screen: 'WorkoutRecommendations' })}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              <RecommendedWorkoutCard
                workout={todayRecommendation}
                onPress={() => navigation.navigate('WorkoutsTab', { screen: 'WorkoutRecommendations' })}
              />
            </View>
          )}

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('WorkoutsTab', { screen: 'LogWorkout' })}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.quickActionGradient}>
                <Ionicons name="add-circle" size={28} color={Colors.white} />
                <Text style={styles.quickActionText}>Log Workout</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('WorkoutsTab', { screen: 'WorkoutRecommendations' })}
              activeOpacity={0.85}
            >
              <LinearGradient colors={[Colors.accent, Colors.accentDark]} style={styles.quickActionGradient}>
                <Ionicons name="star" size={28} color={Colors.white} />
                <Text style={styles.quickActionText}>Get Inspired</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Connected Services */}
          <TouchableOpacity
            style={styles.servicesCard}
            onPress={() => navigation.navigate('Profile', { screen: 'ConnectedServices' })}
            activeOpacity={0.85}
          >
            <View style={styles.servicesLeft}>
              <Ionicons name="link" size={22} color={Colors.primary} />
              <View>
                <Text style={styles.servicesTitle}>Connected Services</Text>
                <Text style={styles.servicesSubtitle}>
                  {connectedCount > 0
                    ? `${connectedCount} service${connectedCount > 1 ? 's' : ''} connected`
                    : 'Connect Peloton, Apple Health & more'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>

          {/* Recent Workouts */}
          {recentLogs.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Workouts</Text>
                <TouchableOpacity onPress={() => navigation.navigate('WorkoutsTab')}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              {recentLogs.slice(0, 3).map((log) => (
                <WorkoutCard
                  key={log.id}
                  workout={log}
                  onPress={() =>
                    navigation.navigate('WorkoutsTab', {
                      screen: 'WorkoutDetail',
                      params: { workoutId: log.id },
                    })
                  }
                />
              ))}
            </View>
          )}

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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  greeting: { fontSize: FontSize.md, color: 'rgba(255,255,255,0.6)' },
  heroName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.white },
  heroDate: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.5)', marginBottom: Spacing.sm },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,107,53,0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  goalBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  notifBtn: { padding: 4 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  section: { marginBottom: Spacing.xl },
  metricsRow: { flexDirection: 'row', marginBottom: Spacing.lg },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  insightText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  quickActions: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  quickAction: { flex: 1, borderRadius: BorderRadius.lg, overflow: 'hidden', ...Shadow.md },
  quickActionGradient: { alignItems: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  quickActionText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.white },
  servicesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  servicesLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  servicesTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: 2 },
  servicesSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary },
});
