import { Tabs } from 'expo-router';
import { Text, Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#2A2A2A',
          height: Platform.OS === 'web' ? 60 : 85,
          paddingBottom: Platform.OS === 'web' ? 8 : 30,
          paddingTop: Platform.OS === 'web' ? 8 : 10,
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#6B7280',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>{'\uD83D\uDCCD'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>{'\uD83C\uDFC6'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>{'\uD83D\uDE4D'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>{'\u2699\uFE0F'}</Text>
          ),
        }}
      />
    </Tabs>
  );
}
