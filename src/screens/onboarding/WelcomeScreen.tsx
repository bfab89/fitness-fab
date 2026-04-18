import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Welcome'>;
};

const FEATURES = [
  { icon: 'barbell-outline' as const, text: 'Personalized workout plans' },
  { icon: 'nutrition-outline' as const, text: 'Tailored nutrition guidance' },
  { icon: 'trending-up-outline' as const, text: 'Track your progress' },
  { icon: 'link-outline' as const, text: 'Connect Peloton, Apple Health & more' },
];

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <LinearGradient
      colors={[Colors.secondary, '#16213E', '#0F3460']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="flash" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>FitnessFab</Text>
          <Text style={styles.tagline}>Your complete fitness companion</Text>
        </View>

        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationCircle}>
            <Ionicons name="fitness" size={100} color={Colors.primary} style={{ opacity: 0.9 }} />
          </View>
          <View style={[styles.floatingBadge, styles.badge1]}>
            <Ionicons name="flame" size={16} color={Colors.primary} />
            <Text style={styles.badgeText}>Burn calories</Text>
          </View>
          <View style={[styles.floatingBadge, styles.badge2]}>
            <Ionicons name="trophy" size={16} color={Colors.accent} />
            <Text style={styles.badgeText}>Reach goals</Text>
          </View>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.getStartedBtn}
            onPress={() => navigation.navigate('ProfileSetup')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnGradient}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.terms}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(255,107,53,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.6)',
    marginTop: Spacing.xs,
  },
  illustrationContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  illustrationCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,107,53,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.2)',
  },
  floatingBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: 6,
    backdropFilter: 'blur(10px)',
  },
  badge1: {
    top: '20%',
    right: 0,
  },
  badge2: {
    bottom: '25%',
    left: 0,
  },
  badgeText: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontWeight: FontWeight.medium,
  },
  features: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,107,53,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: FontWeight.medium,
  },
  footer: {
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  getStartedBtn: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  getStartedText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  terms: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
