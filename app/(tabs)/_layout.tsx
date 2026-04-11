import { Tabs } from 'expo-router';
import { Home, Search, ScanLine, UserSquare2 } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0C10',
          borderTopColor: '#2A3040',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#E8E0D4',
        tabBarInactiveTintColor: '#2A3040',
        tabBarLabelStyle: {
          fontFamily: 'IBMPlexMono-Regular',
          fontSize: 10,
          textTransform: 'uppercase',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Base',
          tabBarIcon: ({ color, size }) => <Home color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="artifacts"
        options={{
          title: 'Archive',
          tabBarIcon: ({ color, size }) => <Search color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => <ScanLine color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <UserSquare2 color={color} size={20} />,
        }}
      />
    </Tabs>
  );
}
