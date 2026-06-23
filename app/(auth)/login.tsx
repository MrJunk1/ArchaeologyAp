import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Lock, Mail } from 'lucide-react-native';
import { StatusBanner, StatusType } from '../../src/components/StatusBanner';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);

  async function signInWithEmail() {
    // Clear previous status
    setStatus(null);

    // Validate inputs
    if (!email.trim()) {
      setStatus({ type: 'error', message: 'Please enter your Operator ID (Email).' });
      return;
    }
    if (!password) {
      setStatus({ type: 'error', message: 'Please enter your Passcode.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setStatus({ type: 'success', message: 'Identity verified. Initializing session…' });
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-obsidian relative justify-center px-6">
      {/* Background blueprint grid subtle overlay */}
      <View className="absolute inset-0 opacity-5" style={{ backgroundColor: '#1A3A4A' }} />
      
      <View className="mb-12">
        <Text className="text-bone font-display text-5xl mb-2 tracking-wide">Artifacta</Text>
        <View className="h-[1px] w-16 bg-copper mb-4" />
        <Text className="text-parchment font-mono tracking-widest text-xs uppercase">Curatorial Access Terminal v1.0</Text>
      </View>

      {/* Inline status feedback */}
      <StatusBanner
        type={status?.type ?? 'info'}
        message={status?.message ?? ''}
        visible={!!status}
        onDismiss={() => setStatus(null)}
        autoDismissMs={status?.type === 'success' ? 3000 : 8000}
      />

      <View className="space-y-4">
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

        <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center mt-4">
           <Lock className="text-slate-wire mr-3" size={20} />
           <TextInput
             className="flex-1 text-bone font-body text-lg"
             placeholder="Passcode"
             placeholderTextColor="#2A3040"
             value={password}
             onChangeText={(t) => { setPassword(t); setStatus(null); }}
             secureTextEntry
           />
        </View>

        <TouchableOpacity 
          className="bg-copper py-4 items-center rounded-sm border border-copper/50 mt-8 flex-row justify-center"
          onPress={signInWithEmail}
          disabled={loading}
          style={loading ? { opacity: 0.7 } : undefined}
        >
          {loading ? (
            <ActivityIndicator color="#0A0C10" />
          ) : (
            <Text className="text-obsidian font-monoBold uppercase tracking-widest">Authenticate</Text>
          )}
        </TouchableOpacity>

        <View className="items-center mt-2 space-y-2">
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity className="py-2 items-center">
              <Text className="text-parchment font-mono text-xs uppercase tracking-wider">Request Access Credentials</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity className="py-2 items-center">
              <Text className="text-slate-wire font-mono text-xs uppercase tracking-wider underline">Forgot Passcode?</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}
