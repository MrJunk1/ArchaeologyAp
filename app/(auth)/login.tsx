import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { BlurView } from 'expo-blur';
import { supabase } from '../../src/lib/supabase';
import { Lock, Mail } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert('Error', error.message);
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

      <View className="space-y-4">
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

        <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center mt-4">
           <Lock className="text-slate-wire mr-3" size={20} />
           <TextInput
             className="flex-1 text-bone font-body text-lg"
             placeholder="Passcode"
             placeholderTextColor="#2A3040"
             value={password}
             onChangeText={setPassword}
             secureTextEntry
           />
        </View>

        <TouchableOpacity 
          className="bg-copper py-4 items-center rounded-sm border border-copper/50 mt-8 flex-row justify-center"
          onPress={signInWithEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0A0C10" />
          ) : (
            <Text className="text-obsidian font-monoBold uppercase tracking-widest">Authenticate</Text>
          )}
        </TouchableOpacity>

        <Link href="/(auth)/register" asChild>
          <TouchableOpacity className="py-4 items-center mt-2">
            <Text className="text-parchment font-mono text-xs uppercase tracking-wider">Request Access Credentials</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
