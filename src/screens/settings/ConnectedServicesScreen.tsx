import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, Modal,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setServiceConnection, disconnectService } from '../../store/userSlice';
import { importWorkouts } from '../../store/workoutSlice';
import { ConnectedService } from '../../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../constants/theme';
import ServiceConnectionCard from '../../components/ServiceConnectionCard';
import { loginWithPeloton, logoutPeloton, fetchPelotonWorkouts } from '../../services/oauth/peloton';
import { requestAppleHealthPermissions, fetchAppleHealthWorkouts, APPLE_HEALTH_AVAILABLE } from '../../services/oauth/appleHealth';
import { useMyNetDiaryAuth, exchangeCodeForTokens, disconnectMyNetDiary } from '../../services/oauth/myNetDiary';
import * as AuthSession from 'expo-auth-session';

function PelotonLoginModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: (username: string, sessionId: string) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your Peloton username and password.');
      return;
    }
    setLoading(true);
    try {
      const conn = await loginWithPeloton(username.trim(), password);
      onSuccess(conn.username ?? username.trim(), conn.accessToken ?? '');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message ?? 'Could not connect to Peloton.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <SafeAreaView style={modalStyles.container}>
          <View style={modalStyles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={modalStyles.title}>Connect Peloton</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={modalStyles.body}>
            <View style={modalStyles.iconContainer}>
              <Ionicons name="bicycle" size={48} color="#CC0000" />
            </View>
            <Text style={modalStyles.description}>
              Sign in with your Peloton credentials to sync your workouts and browse classes.
            </Text>
            <TextInput
              style={modalStyles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username or email"
              placeholderTextColor={Colors.textLight}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            <TextInput
              style={modalStyles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={Colors.textLight}
              secureTextEntry
            />
            <TouchableOpacity
              style={[modalStyles.loginBtn, loading && modalStyles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}
            >
              <Text style={modalStyles.loginBtnText}>
                {loading ? 'Connecting...' : 'Connect Peloton'}
              </Text>
            </TouchableOpacity>
            <Text style={modalStyles.disclaimer}>
              Your credentials are stored securely on your device and never sent to our servers.
            </Text>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  body: { padding: Spacing.xl, alignItems: 'center' },
  iconContainer: { width: 80, height: 80, borderRadius: BorderRadius.xl, backgroundColor: '#CC000015', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  description: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
  input: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  loginBtn: { width: '100%', backgroundColor: '#CC0000', borderRadius: BorderRadius.full, paddingVertical: Spacing.lg, alignItems: 'center', marginTop: Spacing.sm },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.white },
  disclaimer: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.lg, lineHeight: 18 },
});

export default function ConnectedServicesScreen() {
  const dispatch = useAppDispatch();
  const connections = useAppSelector((s) => s.user.connections);
  const [loadingService, setLoadingService] = useState<ConnectedService | null>(null);
  const [showPelotonModal, setShowPelotonModal] = useState(false);

  const { request: mndRequest, response: mndResponse, promptAsync: mndPromptAsync } = useMyNetDiaryAuth();

  React.useEffect(() => {
    if (mndResponse?.type === 'success') {
      const { code } = mndResponse.params;
      const codeVerifier = mndRequest?.codeVerifier;
      if (code && codeVerifier) {
        setLoadingService('mynetdiary');
        exchangeCodeForTokens(code, codeVerifier)
          .then((conn) => {
            dispatch(setServiceConnection(conn));
          })
          .catch((err) => {
            Alert.alert('Connection Failed', err.message ?? 'Could not connect to MyNetDiary.');
          })
          .finally(() => setLoadingService(null));
      }
    }
  }, [mndResponse]);

  async function handleConnect(service: ConnectedService) {
    switch (service) {
      case 'peloton':
        setShowPelotonModal(true);
        break;

      case 'apple-health':
      case 'apple-fitness':
        if (!APPLE_HEALTH_AVAILABLE) {
          Alert.alert('iOS Only', 'Apple Health is only available on iOS devices.');
          return;
        }
        setLoadingService(service);
        try {
          const granted = await requestAppleHealthPermissions();
          if (granted) {
            dispatch(setServiceConnection({
              service,
              connected: true,
              lastSync: new Date().toISOString(),
            }));
            // Import recent workouts
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            const workouts = await fetchAppleHealthWorkouts(start, end);
            if (workouts.length > 0) dispatch(importWorkouts(workouts));
          }
        } catch (err: any) {
          Alert.alert('Error', err.message);
        } finally {
          setLoadingService(null);
        }
        break;

      case 'mynetdiary':
        if (!mndRequest) {
          Alert.alert('Setup Required', 'MyNetDiary OAuth credentials need to be configured in app settings.');
          return;
        }
        await mndPromptAsync();
        break;
    }
  }

  async function handleDisconnect(service: ConnectedService) {
    Alert.alert(
      'Disconnect Service',
      `Are you sure you want to disconnect ${service}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            if (service === 'peloton') await logoutPeloton();
            if (service === 'mynetdiary') await disconnectMyNetDiary();
            dispatch(disconnectService(service));
          },
        },
      ]
    );
  }

  function handlePelotonSuccess(username: string, sessionId: string) {
    setShowPelotonModal(false);
    dispatch(setServiceConnection({
      service: 'peloton',
      connected: true,
      username,
      accessToken: sessionId,
      lastSync: new Date().toISOString(),
    }));
    // Background: sync recent Peloton workouts
    fetchPelotonWorkouts()
      .then((workouts) => {
        // Map Peloton format to WorkoutLog format
        const logs = workouts.map((w: any) => ({
          id: `peloton-${w.id}`,
          date: new Date(w.start_time * 1000).toISOString(),
          title: w.name ?? 'Peloton Workout',
          category: mapPelotonDiscipline(w.fitness_discipline),
          durationMinutes: Math.round(w.duration / 60),
          caloriesBurned: w.calories ?? undefined,
          exercises: [],
          source: 'peloton' as const,
        }));
        if (logs.length > 0) dispatch(importWorkouts(logs));
      })
      .catch(() => {});
  }

  function mapPelotonDiscipline(discipline: string): any {
    const map: Record<string, string> = {
      cycling: 'cycling',
      running: 'running',
      strength: 'strength',
      yoga: 'yoga',
      cardio: 'cardio',
      stretching: 'flexibility',
      meditation: 'other',
    };
    return map[discipline?.toLowerCase()] ?? 'other';
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} />
          <Text style={styles.infoText}>
            Connect your fitness platforms to automatically sync workouts and nutrition data. All authentication tokens are stored securely on your device.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Fitness Platforms</Text>
        {connections.map((conn) => (
          <ServiceConnectionCard
            key={conn.service}
            connection={conn}
            onConnect={() => handleConnect(conn.service)}
            onDisconnect={() => handleDisconnect(conn.service)}
            loading={loadingService === conn.service}
          />
        ))}

        <Text style={styles.sectionTitle}>What Gets Synced</Text>
        {[
          { icon: 'barbell-outline' as const, label: 'Peloton', desc: 'Cycling, running, strength & yoga classes' },
          { icon: 'heart-outline' as const, label: 'Apple Health', desc: 'Workouts, steps, heart rate & body metrics' },
          { icon: 'body-outline' as const, label: 'Apple Fitness+', desc: 'Completed Apple Fitness+ workouts' },
          { icon: 'nutrition-outline' as const, label: 'MyNetDiary', desc: 'Food diary, calorie & macro tracking' },
        ].map((item, i) => (
          <View key={i} style={styles.syncItem}>
            <View style={styles.syncIcon}>
              <Ionicons name={item.icon} size={18} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.syncLabel}>{item.label}</Text>
              <Text style={styles.syncDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      <PelotonLoginModal
        visible={showPelotonModal}
        onClose={() => setShowPelotonModal(false)}
        onSuccess={handlePelotonSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  infoCard: {
    flexDirection: 'row',
    gap: Spacing.md,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    alignItems: 'flex-start',
  },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md, marginTop: Spacing.lg },
  syncItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
  syncIcon: { width: 36, height: 36, borderRadius: BorderRadius.sm, backgroundColor: `${Colors.primary}12`, alignItems: 'center', justifyContent: 'center' },
  syncLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  syncDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
});
