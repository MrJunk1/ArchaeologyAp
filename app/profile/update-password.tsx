import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { BlueprintGrid } from '../../src/components/BlueprintGrid';

export default function UpdatePasswordScreen() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpdatePassword() {
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Passcode must be at least 6 characters.');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Security token updated.', [
        { text: 'Acknowledge', onPress: () => router.back() }
      ]);
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

        <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center relative overflow-hidden">
           <Lock className="text-slate-wire mr-3" size={20} />
           <TextInput
             className="flex-1 text-bone font-body text-lg"
             placeholder="New Passcode"
             placeholderTextColor="#2A3040"
             value={password}
             onChangeText={setPassword}
             secureTextEntry
           />
        </View>

        <TouchableOpacity 
          className="bg-copper py-4 items-center rounded-sm border border-copper/50 mt-4 flex-row justify-center active:bg-copper/80"
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color="#0A0C10" />
          ) : (
            <Text className="text-obsidian font-monoBold uppercase tracking-widest">Update Passcode</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
