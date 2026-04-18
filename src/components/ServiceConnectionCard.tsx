import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ConnectedService, ServiceConnection } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, Shadow } from '../constants/theme';

interface ServiceInfo {
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const SERVICE_INFO: Record<ConnectedService, ServiceInfo> = {
  peloton: {
    name: 'Peloton',
    description: 'Sync your cycling & fitness classes',
    icon: 'bicycle',
    color: '#CC0000',
  },
  'apple-health': {
    name: 'Apple Health',
    description: 'Read workouts, steps & vitals (iOS)',
    icon: 'heart',
    color: '#FF2D55',
  },
  'apple-fitness': {
    name: 'Apple Fitness+',
    description: 'Import Apple Fitness+ workouts (iOS)',
    icon: 'body',
    color: '#FF9500',
  },
  mynetdiary: {
    name: 'MyNetDiary',
    description: 'Sync nutrition and food diary data',
    icon: 'nutrition',
    color: '#34C759',
  },
};

interface Props {
  connection: ServiceConnection;
  onConnect: () => void;
  onDisconnect: () => void;
  loading?: boolean;
}

export default function ServiceConnectionCard({
  connection,
  onConnect,
  onDisconnect,
  loading = false,
}: Props) {
  const info = SERVICE_INFO[connection.service];
  const { connected } = connection;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${info.color}15` }]}>
        <Ionicons name={info.icon} size={24} color={info.color} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{info.name}</Text>
        <Text style={styles.description}>{info.description}</Text>
        {connected && connection.username && (
          <Text style={styles.account}>{connection.username}</Text>
        )}
        {connected && connection.lastSync && (
          <Text style={styles.lastSync}>
            Synced {format(new Date(connection.lastSync), 'MMM d, h:mm a')}
          </Text>
        )}
      </View>

      <View style={styles.action}>
        {loading ? (
          <ActivityIndicator size="small" color={info.color} />
        ) : connected ? (
          <View style={styles.connectedRow}>
            <View style={styles.statusDot} />
            <TouchableOpacity onPress={onDisconnect} style={styles.disconnectBtn}>
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.connectBtn, { backgroundColor: info.color }]}
            onPress={onConnect}
            activeOpacity={0.85}
          >
            <Text style={styles.connectText}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
    ...Shadow.sm,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  description: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  account: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    marginTop: 3,
    fontWeight: FontWeight.medium,
  },
  lastSync: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 1,
  },
  action: {
    alignItems: 'flex-end',
    minWidth: 90,
  },
  connectedRow: {
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  disconnectBtn: {
    padding: 4,
  },
  disconnectText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    fontWeight: FontWeight.medium,
  },
  connectBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  connectText: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontWeight: FontWeight.semibold,
  },
});
