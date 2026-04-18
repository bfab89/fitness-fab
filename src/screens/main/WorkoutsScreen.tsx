import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { CATEGORY_LABELS } from '../../constants/workouts';
import { WorkoutCategory } from '../../types';
import WorkoutCard from '../../components/WorkoutCard';

const CATEGORIES: { value: WorkoutCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'running', label: 'Running' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'cycling', label: 'Cycling' },
];

export default function WorkoutsScreen() {
  const navigation = useNavigation<any>();
  const logs = useAppSelector((s) => s.workouts.logs);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<WorkoutCategory | 'all'>('all');

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'all' || log.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [logs, search, category]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Workouts</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('WorkoutRecommendations')}
          >
            <Ionicons name="star-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, styles.logBtn]}
            onPress={() => navigation.navigate('LogWorkout')}
          >
            <Ionicons name="add" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search workouts..."
          placeholderTextColor={Colors.textLight}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        keyExtractor={(item) => item.value}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.categoryChip, category === item.value && styles.categoryChipActive]}
            onPress={() => setCategory(item.value)}
          >
            <Text style={[styles.categoryChipText, category === item.value && styles.categoryChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="barbell-outline" size={60} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No workouts yet</Text>
          <Text style={styles.emptySubtitle}>
            {logs.length === 0
              ? 'Log your first workout to get started!'
              : 'No workouts match your search.'}
          </Text>
          {logs.length === 0 && (
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('LogWorkout')}
            >
              <Text style={styles.emptyBtnText}>Log Workout</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <WorkoutCard
              workout={item}
              onPress={() => navigation.navigate('WorkoutDetail', { workoutId: item.id })}
            />
          )}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              {filtered.length} workout{filtered.length !== 1 ? 's' : ''}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  logBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  categoryList: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.md, gap: Spacing.sm },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  categoryChipTextActive: { color: Colors.white },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  resultCount: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing.lg },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 22 },
  emptyBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  emptyBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.white },
});
