import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react-native';
import { StatusBanner, StatusType } from '../../src/components/StatusBanner';

// Only import Linking on native — on web we use window.location.origin
let createURL: ((path: string) => string) | undefined;
if (Platform.OS !== 'web') {
  // Dynamic require so web bundles don't pull in expo-linking
  const Linking = require('expo-linking');
  createURL = Linking.createURL;
}

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);
  const router = useRouter();

  function getRedirectUrl(): string {
    if (Platform.OS === 'web') {
      // On Vercel / any web host, use the current origin so the redirect
      // URL matches the deployed domain (e.g. https://your-app.vercel.app)
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      return `${origin}/profile/update-password`;
    }
    // On native, use the Expo deep link scheme
    return createURL ? createURL('profile/update-password') : 'profile/update-password';
  }

  async function resetPassword() {
    setStatus(null);

    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Please enter your Operator ID (Email).' });
      return;
    }
    if (!email.includes('@')) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    
    setLoading(true);
    const redirectUrl = getRedirectUrl();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl,
    });

    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setSent(true);
      setStatus({
        type: 'success',
        message: 'A recovery link has been transmitted to your secure inbox. Follow the instructions to reinstate your clearance.',
      });
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-obsidian relative px-6 justify-center">
      <View className="absolute inset-0 opacity-5" style={{ backgroundColor: '#1A3A4A' }} />
      
      <TouchableOpacity 
        className="absolute top-16 left-6 flex-row items-center z-10 p-2"
        onPress={() => router.back()}
      >
        <ArrowLeft color="#C4B9A8" size={20} className="mr-2" />
        <Text className="text-parchment font-mono text-xs uppercase tracking-widest">Back</Text>
      </TouchableOpacity>

      <View className="mb-12">
        <View className="w-12 h-12 border border-copper bg-carbon justify-center items-center rounded-sm mb-6">
           <KeyRound color="#48A89C" size={24} />
        </View>
        <Text className="text-bone font-display text-4xl mb-2 tracking-wide uppercase">Recover Access</Text>
        <View className="h-[1px] w-16 bg-copper mb-4" />
        <Text className="text-parchment font-mono tracking-widest text-xs uppercase leading-relaxed">
          {sent
            ? "Recovery protocol initiated. Check your inbox."
            : "Enter your assigned Operator ID to initiate the passcode recovery protocol."}
        </Text>
      </View>

      {/* Inline status feedback */}
      <StatusBanner
        type={status?.type ?? 'info'}
        message={status?.message ?? ''}
        visible={!!status}
        onDismiss={sent ? undefined : () => setStatus(null)}
        autoDismissMs={sent ? 0 : 8000}
      />

      {!sent ? (
        <View className="space-y-4 shadow-xl">
          <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center relative overflow-hidden">
             <Mail className="text-slate-wire mr-3" size={20} />
             <TextInput
               className="flex-1 text-bone font-body text-lg"
               placeholder="Operator ID (Email)"
               placeholderTextColor="#2A3040"
               value={email}
               onChangeText={(t) => { setEmail(t); setStatus(null); }}
               autoCapitalize="none"
               keyboardType="email-address"
             />
          </View>

          <TouchableOpacity 
            className="bg-copper py-4 items-center rounded-sm border border-copper/50 mt-8 flex-row justify-center active:bg-copper/80"
            onPress={resetPassword}
            disabled={loading}
            style={loading ? { opacity: 0.7 } : undefined}
          >
            {loading ? (
              <ActivityIndicator color="#0A0C10" />
            ) : (
              <Text className="text-obsidian font-monoBold uppercase tracking-widest">Transmit Recovery Link</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mt-4">
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity className="bg-copper py-4 items-center rounded-sm border border-copper/50 flex-row justify-center">
              <Text className="text-obsidian font-monoBold uppercase tracking-widest">Return to Login</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity 
            className="py-4 items-center mt-3"
            onPress={() => { setSent(false); setStatus(null); }}
          >
            <Text className="text-parchment font-mono text-xs uppercase tracking-wider underline">Resend Recovery Link</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
