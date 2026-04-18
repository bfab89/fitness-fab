import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setProfile } from '../../store/userSlice';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { GOAL_LABELS } from '../../constants/workouts';
import { selectWeeklyStats } from '../../store/workoutSlice';

function cm2display(cm: number, metric = false): string {
  if (metric) return `${cm} cm`;
  const totalIn = Math.round(cm / 2.54);
  return `${Math.floor(totalIn / 12)}'${totalIn % 12}"`;
}

function kg2display(kg: number, metric = false): string {
  if (metric) return `${kg} kg`;
  return `${Math.round(kg * 2.20462)} lbs`;
}

interface RowProps { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }
function InfoRow({ label, value, icon }: RowProps) {
  return (
    <View style={rowStyles.container}>
      <View style={rowStyles.iconBox}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={rowStyles.value}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  iconBox: { width: 32, height: 32, borderRadius: BorderRadius.sm, backgroundColor: `${Colors.primary}12`, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  label: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary },
  value: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
});

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.user.profile);
  const logs = useAppSelector((s) => s.workouts.logs);
  const connections = useAppSelector((s) => s.user.connections);
  const weeklyStats = selectWeeklyStats(logs);
  const connectedCount = connections.filter((c) => c.connected).length;

  function handleResetProfile() {
    Alert.alert(
      'Reset Profile',
      'This will clear your profile and return to onboarding. Your workout logs will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => dispatch(setProfile({ ...profile!, onboardingComplete: false })),
        },
      ]
    );
  }

  if (!profile) return null;

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.secondary, '#16213E']} style={styles.hero}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.heroName}>{profile.name}</Text>
          <Text style={styles.heroLevel}>{capitalize(profile.fitnessLevel)} · {profile.age} years old</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{logs.length}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{weeklyStats.count}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile.goals.length}</Text>
              <Text style={styles.statLabel}>Goals</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Body Stats */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Body Stats</Text>
            <InfoRow label="Height" value={cm2display(profile.heightCm)} icon="resize-outline" />
            <InfoRow label="Weight" value={kg2display(profile.weightKg)} icon="scale-outline" />
            <InfoRow label="Gender" value={capitalize(profile.gender)} icon="person-outline" />
            <InfoRow label="Fitness Level" value={capitalize(profile.fitnessLevel)} icon="fitness-outline" />
          </View>

          {/* Goals */}
          {profile.goals.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>My Goals</Text>
              <View style={styles.goalsGrid}>
                {profile.goals.map((goal) => (
                  <View key={goal} style={styles.goalChip}>
                    <Text style={styles.goalChipText}>{GOAL_LABELS[goal]}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Connected Services */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ConnectedServices')}
            activeOpacity={0.85}
          >
            <View style={[styles.menuIcon, { backgroundColor: `${Colors.primary}15` }]}>
              <Ionicons name="link" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>Connected Services</Text>
              <Text style={styles.menuSub}>{connectedCount > 0 ? `${connectedCount} connected` : 'Peloton, Apple Health & more'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>

          {/* App Section */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.85}>
            <View style={[styles.menuIcon, { backgroundColor: `${Colors.accent}15` }]}>
              <Ionicons name="notifications-outline" size={20} color={Colors.accent} />
            </View>
            <Text style={styles.menuLabel}>Notifications</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.85}>
            <View style={[styles.menuIcon, { backgroundColor: `${Colors.info}15` }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.info} />
            </View>
            <Text style={styles.menuLabel}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleResetProfile} activeOpacity={0.85}>
            <View style={[styles.menuIcon, { backgroundColor: `${Colors.error}15` }]}>
              <Ionicons name="refresh-outline" size={20} color={Colors.error} />
            </View>
            <Text style={[styles.menuLabel, { color: Colors.error }]}>Reset Profile</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </TouchableOpacity>

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
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 36, fontWeight: FontWeight.bold, color: Colors.white },
  heroName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.white, marginBottom: 4 },
  heroLevel: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', marginBottom: Spacing.xl },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { alignItems: 'center', paddingHorizontal: Spacing.xl },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
  statValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.white },
  statLabel: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  goalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  goalChip: {
    backgroundColor: `${Colors.primary}12`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  goalChipText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
  menuSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});
