import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Lock, Mail, User, Briefcase } from 'lucide-react-native';
import { StatusBanner, StatusType } from '../../src/components/StatusBanner';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'researcher' | 'restorer' | 'student'>('researcher');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);
  const [registered, setRegistered] = useState(false);

  async function signUpWithEmail() {
    setStatus(null);

    // Validate inputs
    if (!fullName.trim()) {
      setStatus({ type: 'error', message: 'Please enter your full name.' });
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (!password || password.length < 6) {
      setStatus({ type: 'error', message: 'Passcode must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role: role,
        }
      }
    });

    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setRegistered(true);
      setStatus({
        type: 'success',
        message: 'Credentials issued. A verification link has been sent to your email. Please confirm to activate your profile.',
      });
    }
    setLoading(false);
  }

  return (
    <ScrollView
      className="flex-1 bg-obsidian"
      contentContainerStyle={{ justifyContent: 'center', flexGrow: 1, paddingHorizontal: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-8 mt-12">
        <Text className="text-bone font-display text-4xl mb-2">New Profile</Text>
        <Text className="text-parchment font-mono text-xs uppercase tracking-widest">Operator Registration</Text>
      </View>

      {/* Inline status feedback */}
      <StatusBanner
        type={status?.type ?? 'info'}
        message={status?.message ?? ''}
        visible={!!status}
        onDismiss={registered ? undefined : () => setStatus(null)}
        autoDismissMs={registered ? 0 : 8000}
      />

      {registered ? (
        /* After successful registration, show confirmation + link back */
        <View className="mt-4">
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity className="bg-copper py-4 items-center rounded-sm border border-copper/50 flex-row justify-center">
              <Text className="text-obsidian font-monoBold uppercase tracking-widest">Return to Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <View className="space-y-4">
          <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center relative overflow-hidden mb-4">
             <User className="text-slate-wire mr-3" size={20} />
             <TextInput
               className="flex-1 text-bone font-body text-lg"
               placeholder="Full Name"
               placeholderTextColor="#2A3040"
               value={fullName}
               onChangeText={(t) => { setFullName(t); setStatus(null); }}
             />
          </View>

          <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center relative overflow-hidden mb-4">
             <Mail className="text-slate-wire mr-3" size={20} />
             <TextInput
               className="flex-1 text-bone font-body text-lg"
               placeholder="Email Address"
               placeholderTextColor="#2A3040"
               value={email}
               onChangeText={(t) => { setEmail(t); setStatus(null); }}
               autoCapitalize="none"
               keyboardType="email-address"
             />
          </View>

          <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center mb-6">
             <Lock className="text-slate-wire mr-3" size={20} />
             <TextInput
               className="flex-1 text-bone font-body text-lg"
               placeholder="Secure Passcode (min 6 chars)"
               placeholderTextColor="#2A3040"
               value={password}
               onChangeText={(t) => { setPassword(t); setStatus(null); }}
               secureTextEntry
             />
          </View>

          <Text className="text-parchment font-mono text-xs uppercase mb-2">Select Clearance Level</Text>
          <View className="flex-row justify-between mb-8">
            {(['researcher', 'restorer', 'student'] as const).map((r) => (
              <TouchableOpacity 
                key={r}
                onPress={() => setRole(r)}
                className={`flex-1 items-center py-3 border ${role === r ? 'border-copper bg-copper/10' : 'border-slate-wire bg-carbon'} mx-1 rounded-sm`}
              >
                <Text className={`font-mono text-xs uppercase ${role === r ? 'text-copper' : 'text-slate-wire'}`}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            className="bg-parchment py-4 items-center rounded-sm border border-bone mt-2 flex-row justify-center"
            onPress={signUpWithEmail}
            disabled={loading}
            style={loading ? { opacity: 0.7 } : undefined}
          >
            {loading ? (
              <ActivityIndicator color="#0A0C10" />
            ) : (
              <Text className="text-obsidian font-monoBold uppercase tracking-widest">Issue Credentials</Text>
            )}
          </TouchableOpacity>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity className="py-4 items-center mt-2">
              <Text className="text-parchment font-mono text-xs uppercase tracking-wider">Cancel Registration</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}
    </ScrollView>
  );
}
