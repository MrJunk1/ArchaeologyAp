import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react-native';
import * as Linking from 'expo-linking';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  async function resetPassword() {
    if (!email) {
      Alert.alert('Error', 'Please enter your Operator ID (Email).');
      return;
    }
    
    setLoading(true);
    // Create universal redirect URL compatible with Expo Go and compiled apps
    const redirectUrl = Linking.createURL('profile/update-password');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSent(true);
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
            ? "A recovery link has been transmitted to your secure inbox. Follow the instructions to reinstate your clearance." 
            : "Enter your assigned Operator ID to initiate the passcode recovery protocol."}
        </Text>
      </View>

      {!sent ? (
        <View className="space-y-4 shadow-xl">
          <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center relative overflow-hidden">
             <Mail className="text-slate-wire mr-3" size={20} />
             <TextInput
               className="flex-1 text-bone font-body text-lg"
               placeholder="Operator ID (Email)"
               placeholderTextColor="#2A3040"
               value={email}
               onChangeText={setEmail}
               autoCapitalize="none"
               keyboardType="email-address"
             />
          </View>

          <TouchableOpacity 
            className="bg-copper py-4 items-center rounded-sm border border-copper/50 mt-8 flex-row justify-center active:bg-copper/80"
            onPress={resetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0A0C10" />
            ) : (
              <Text className="text-obsidian font-monoBold uppercase tracking-widest">Transmit Recovery Link</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mt-8 border border-copper/30 bg-carbon p-6 rounded-sm">
          <Text className="text-copper font-mono text-sm tracking-widest text-center">
            TRANSMISSION SUCCESSFUL
          </Text>
        </View>
      )}
    </View>
  );
}
