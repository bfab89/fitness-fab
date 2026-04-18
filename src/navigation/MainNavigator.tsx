import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight } from '../constants/theme';
import { MainTabParamList, WorkoutsStackParamList, ProfileStackParamList } from '../types';

import DashboardScreen from '../screens/main/DashboardScreen';
import WorkoutsScreen from '../screens/main/WorkoutsScreen';
import NutritionScreen from '../screens/main/NutritionScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import WorkoutDetailScreen from '../screens/workouts/WorkoutDetailScreen';
import LogWorkoutScreen from '../screens/workouts/LogWorkoutScreen';
import WorkoutRecommendationsScreen from '../screens/workouts/WorkoutRecommendationsScreen';
import ConnectedServicesScreen from '../screens/settings/ConnectedServicesScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const WorkoutsStack = createNativeStackNavigator<WorkoutsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

function WorkoutsStackNavigator() {
  return (
    <WorkoutsStack.Navigator>
      <WorkoutsStack.Screen
        name="WorkoutsList"
        component={WorkoutsScreen}
        options={{ headerShown: false }}
      />
      <WorkoutsStack.Screen
        name="WorkoutDetail"
        component={WorkoutDetailScreen}
        options={{
          title: 'Workout Details',
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontWeight: FontWeight.semibold },
        }}
      />
      <WorkoutsStack.Screen
        name="LogWorkout"
        component={LogWorkoutScreen}
        options={{
          title: 'Log Workout',
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontWeight: FontWeight.semibold },
          presentation: 'modal',
        }}
      />
      <WorkoutsStack.Screen
        name="WorkoutRecommendations"
        component={WorkoutRecommendationsScreen}
        options={{
          title: 'Recommendations',
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontWeight: FontWeight.semibold },
        }}
      />
    </WorkoutsStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="ConnectedServices"
        component={ConnectedServicesScreen}
        options={{
          title: 'Connected Services',
          headerTintColor: Colors.primary,
          headerTitleStyle: { fontWeight: FontWeight.semibold },
        }}
      />
    </ProfileStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
            Dashboard: ['home', 'home-outline'],
            WorkoutsTab: ['barbell', 'barbell-outline'],
            Nutrition: ['nutrition', 'nutrition-outline'],
            Profile: ['person-circle', 'person-circle-outline'],
          };
          const [filledIcon, outlineIcon] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? filledIcon : outlineIcon} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarLabelStyle: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
        tabBarStyle: { borderTopColor: Colors.border, paddingTop: 4 },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="WorkoutsTab" component={WorkoutsStackNavigator} options={{ tabBarLabel: 'Workouts' }} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} options={{ tabBarLabel: 'Nutrition' }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
