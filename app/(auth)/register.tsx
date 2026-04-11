import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { Lock, Mail, User, Briefcase } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'researcher' | 'restorer' | 'student'>('researcher');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        }
      }
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Profile created successfully.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 bg-obsidian relative justify-center px-6">
      <View className="mb-8 mt-12">
        <Text className="text-bone font-display text-4xl mb-2">New Profile</Text>
        <Text className="text-parchment font-mono text-xs uppercase tracking-widest">Operator Registration</Text>
      </View>

      <View className="space-y-4">
        <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center relative overflow-hidden mb-4">
           <User className="text-slate-wire mr-3" size={20} />
           <TextInput
             className="flex-1 text-bone font-body text-lg"
             placeholder="Full Name"
             placeholderTextColor="#2A3040"
             value={fullName}
             onChangeText={setFullName}
           />
        </View>

        <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center relative overflow-hidden mb-4">
           <Mail className="text-slate-wire mr-3" size={20} />
           <TextInput
             className="flex-1 text-bone font-body text-lg"
             placeholder="Email Address"
             placeholderTextColor="#2A3040"
             value={email}
             onChangeText={setEmail}
             autoCapitalize="none"
             keyboardType="email-address"
           />
        </View>

        <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center mb-6">
           <Lock className="text-slate-wire mr-3" size={20} />
           <TextInput
             className="flex-1 text-bone font-body text-lg"
             placeholder="Secure Passcode"
             placeholderTextColor="#2A3040"
             value={password}
             onChangeText={setPassword}
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
    </View>
  );
}
