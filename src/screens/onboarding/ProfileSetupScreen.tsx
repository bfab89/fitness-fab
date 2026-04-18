import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList, Gender, FitnessLevel } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../../constants/theme';
import { useAppDispatch } from '../../store/hooks';
import { setProfile } from '../../store/userSlice';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'ProfileSetup'>;
};

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const FITNESS_LEVELS: { value: FitnessLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'New to fitness or returning after a break' },
  { value: 'intermediate', label: 'Intermediate', description: 'Consistent workouts for 6+ months' },
  { value: 'advanced', label: 'Advanced', description: 'Training seriously for 2+ years' },
];

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

export default function ProfileSetupScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weight, setWeight] = useState('');
  const [useMetric, setUseMetric] = useState(false);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | null>(null);

  function validate(): boolean {
    if (!name.trim()) { Alert.alert('Missing Info', 'Please enter your name.'); return false; }
    if (!age || isNaN(Number(age)) || Number(age) < 13 || Number(age) > 100) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 13 and 100.'); return false;
    }
    if (!gender) { Alert.alert('Missing Info', 'Please select your gender.'); return false; }
    if (!fitnessLevel) { Alert.alert('Missing Info', 'Please select your fitness level.'); return false; }
    if (!weight || isNaN(Number(weight))) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.'); return false;
    }
    if (!useMetric && (!heightFt || isNaN(Number(heightFt)))) {
      Alert.alert('Invalid Height', 'Please enter a valid height.'); return false;
    }
    if (useMetric && !heightFt) {
      Alert.alert('Invalid Height', 'Please enter a valid height in cm.'); return false;
    }
    return true;
  }

  function handleContinue() {
    if (!validate()) return;

    let heightCm: number;
    if (useMetric) {
      heightCm = Number(heightFt);
    } else {
      const totalInches = Number(heightFt) * 12 + (Number(heightIn) || 0);
      heightCm = Math.round(totalInches * 2.54);
    }

    const weightKg = useMetric ? Number(weight) : Math.round(Number(weight) * 0.453592 * 10) / 10;

    dispatch(
      setProfile({
        id: generateId(),
        name: name.trim(),
        age: Number(age),
        gender: gender!,
        heightCm,
        weightKg,
        fitnessLevel: fitnessLevel!,
        goals: [],
        onboardingComplete: false,
      })
    );
    navigation.navigate('GoalsSetup');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={[styles.progress, { width: '50%' }]} />
        </View>
        <Text style={styles.stepText}>Step 1 of 2</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>We'll use this to personalize your experience</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="First name"
            placeholderTextColor={Colors.textLight}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={[styles.input, styles.inputSmall]}
            value={age}
            onChangeText={setAge}
            placeholder="e.g. 28"
            placeholderTextColor={Colors.textLight}
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.chipRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.chip, gender === g.value && styles.chipSelected]}
                onPress={() => setGender(g.value)}
              >
                <Text style={[styles.chipText, gender === g.value && styles.chipTextSelected]}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Height & Weight</Text>
            <TouchableOpacity onPress={() => setUseMetric(!useMetric)} style={styles.unitToggle}>
              <Text style={styles.unitToggleText}>{useMetric ? 'Switch to Imperial' : 'Switch to Metric'}</Text>
            </TouchableOpacity>
          </View>

          {useMetric ? (
            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: Spacing.sm }]}>
                <TextInput
                  style={styles.input}
                  value={heightFt}
                  onChangeText={setHeightFt}
                  placeholder="Height (cm)"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Weight (kg)"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
              </View>
            </View>
          ) : (
            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: Spacing.sm }]}>
                <TextInput
                  style={styles.input}
                  value={heightFt}
                  onChangeText={setHeightFt}
                  placeholder="Feet"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                  maxLength={1}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: Spacing.sm }]}>
                <TextInput
                  style={styles.input}
                  value={heightIn}
                  onChangeText={setHeightIn}
                  placeholder="Inches"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Lbs"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="numeric"
                />
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Fitness Level</Text>
          {FITNESS_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.value}
              style={[styles.levelCard, fitnessLevel === level.value && styles.levelCardSelected]}
              onPress={() => setFitnessLevel(level.value)}
            >
              <View style={styles.levelContent}>
                <Text style={[styles.levelLabel, fitnessLevel === level.value && styles.levelLabelSelected]}>
                  {level.label}
                </Text>
                <Text style={styles.levelDescription}>{level.description}</Text>
              </View>
              <View style={[styles.radio, fitnessLevel === level.value && styles.radioSelected]}>
                {fitnessLevel === level.value && (
                  <View style={styles.radioDot} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.9}>
          <LinearGradient colors={[Colors.primary, Colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.continueBtnGradient}>
            <Text style={styles.continueBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.white} />
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
  progress: { height: 4, borderRadius: 2 },
  stepText: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'right' },
  scroll: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.xl },
  section: { marginBottom: Spacing.xl },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.sm },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  unitToggle: { padding: 4 },
  unitToggleText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  inputSmall: { width: '40%' },
  inputWrapper: {},
  row: { flexDirection: 'row' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipSelected: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}12` },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  chipTextSelected: { color: Colors.primary },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  levelCardSelected: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}08` },
  levelContent: { flex: 1 },
  levelLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: 2 },
  levelLabelSelected: { color: Colors.primary },
  levelDescription: { fontSize: FontSize.xs, color: Colors.textSecondary },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: Colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  footer: { padding: Spacing.xl, paddingBottom: Spacing.xl },
  continueBtn: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  continueBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg, gap: Spacing.sm },
  continueBtnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.white },
});
