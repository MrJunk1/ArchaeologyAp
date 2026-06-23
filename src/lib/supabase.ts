import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// ──────────────────────────────────────────────────────────────
// Supabase Client — reads from .env.local via Expo's env system
//
// Expo automatically loads variables prefixed with EXPO_PUBLIC_
// from .env.local at build/start time.
// See: https://docs.expo.dev/guides/environment-variables/
// ──────────────────────────────────────────────────────────────

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️  Supabase credentials missing.\n' +
    '   Copy .env.local.example → .env.local and fill in your project URL and anon key.\n' +
    '   The app will run in offline/demo mode until valid credentials are provided.'
  );
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // On web, Supabase appends auth tokens to the URL fragment (#access_token=...)
      // after password recovery redirects. detectSessionInUrl must be true on web
      // so the client picks up these tokens and establishes the recovery session.
      // On native, deep linking is handled separately, so we keep it false.
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);
