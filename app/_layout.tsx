import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useFonts, CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { IBMPlexMono_400Regular, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';
import { CrimsonPro_400Regular } from '@expo-google-fonts/crimson-pro';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { Analytics } from '@vercel/analytics/react';
import '../global.css';

SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { session, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (session && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [session, initialized, segments]);

  return <Slot />;
};

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    'CormorantGaramond-SemiBold': CormorantGaramond_600SemiBold,
    'IBMPlexMono-Regular': IBMPlexMono_400Regular,
    'IBMPlexMono-SemiBold': IBMPlexMono_600SemiBold,
    'CrimsonPro-Regular': CrimsonPro_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || error) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) {
    return null;
  }

  return (
    <AuthProvider>
      <InitialLayout />
      <StatusBar style="light" />
      {Platform.OS === 'web' && <Analytics />}
    </AuthProvider>
  );
}
