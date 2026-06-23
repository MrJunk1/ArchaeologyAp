import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { BlueprintGrid } from '../../src/components/BlueprintGrid';
import { StatusBanner, StatusType } from '../../src/components/StatusBanner';

export default function UpdatePasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: StatusType; message: string } | null>(null);
  const [updated, setUpdated] = useState(false);
  const router = useRouter();

  async function handleUpdatePassword() {
    setStatus(null);

    if (!password || password.length < 6) {
      setStatus({ type: 'error', message: 'Passcode must be at least 6 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passcodes do not match. Please re-enter.' });
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setUpdated(true);
      setStatus({ type: 'success', message: 'Security token updated successfully. You may now proceed.' });
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-obsidian">
      <BlueprintGrid opacity={0.05} gridSize={40} />
      
      <View className="flex-row items-center pt-16 pb-6 px-6 border-b border-slate-wire bg-carbon/50">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-4">
          <ArrowLeft color="#E8E0D4" size={24} />
        </TouchableOpacity>
        <Text className="text-bone font-display text-3xl uppercase tracking-tighter">Change Passcode</Text>
      </View>

      <View className="p-6 space-y-4 shadow-xl">
        <Text className="text-parchment font-body text-base mb-6 leading-relaxed">
          Enter a new passcode to secure your profile. Your session will be maintained after this update.
        </Text>

        {/* Inline status feedback */}
        <StatusBanner
          type={status?.type ?? 'info'}
          message={status?.message ?? ''}
          visible={!!status}
          onDismiss={updated ? undefined : () => setStatus(null)}
          autoDismissMs={updated ? 0 : 8000}
        />

        {!updated ? (
          <>
            <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center relative overflow-hidden">
               <Lock className="text-slate-wire mr-3" size={20} />
               <TextInput
                 className="flex-1 text-bone font-body text-lg"
                 placeholder="New Passcode"
                 placeholderTextColor="#2A3040"
                 value={password}
                 onChangeText={(t) => { setPassword(t); setStatus(null); }}
                 secureTextEntry
               />
            </View>

            <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center relative overflow-hidden mt-4">
               <Lock className="text-slate-wire mr-3" size={20} />
               <TextInput
                 className="flex-1 text-bone font-body text-lg"
                 placeholder="Confirm Passcode"
                 placeholderTextColor="#2A3040"
                 value={confirmPassword}
                 onChangeText={(t) => { setConfirmPassword(t); setStatus(null); }}
                 secureTextEntry
               />
            </View>

            <TouchableOpacity 
              className="bg-copper py-4 items-center rounded-sm border border-copper/50 mt-4 flex-row justify-center active:bg-copper/80"
              onPress={handleUpdatePassword}
              disabled={loading}
              style={loading ? { opacity: 0.7 } : undefined}
            >
              {loading ? (
                 <ActivityIndicator color="#0A0C10" />
              ) : (
                <Text className="text-obsidian font-monoBold uppercase tracking-widest">Update Passcode</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            className="bg-copper py-4 items-center rounded-sm border border-copper/50 mt-4 flex-row justify-center"
            onPress={() => router.replace('/(tabs)')}
          >
            <Text className="text-obsidian font-monoBold uppercase tracking-widest">Continue to Dashboard</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
