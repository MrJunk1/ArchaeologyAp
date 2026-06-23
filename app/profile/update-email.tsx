import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { ArrowLeft, Mail } from 'lucide-react-native';
import { BlueprintGrid } from '../../src/components/BlueprintGrid';

export default function UpdateEmailScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpdateEmail() {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid Operator ID (Email).');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      email: email,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Verification link sent to new Operator ID. Please verify to complete the transfer.', [
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
        <Text className="text-bone font-display text-3xl uppercase tracking-tighter">Update Email</Text>
      </View>

      <View className="p-6 space-y-4 shadow-xl">
        <Text className="text-parchment font-body text-base mb-6 leading-relaxed">
          Modifying your Operator ID will require verification. A secure transmission will be sent to confirm the new routing address.
        </Text>

        <View className="bg-carbon border border-slate-wire rounded-sm p-3 flex-row items-center relative overflow-hidden">
           <Mail className="text-slate-wire mr-3" size={20} />
           <TextInput
             className="flex-1 text-bone font-body text-lg"
             placeholder="New Operator ID (Email)"
             placeholderTextColor="#2A3040"
             value={email}
             onChangeText={setEmail}
             autoCapitalize="none"
             keyboardType="email-address"
           />
        </View>

        <TouchableOpacity 
          className="bg-copper py-4 items-center rounded-sm border border-copper/50 mt-4 flex-row justify-center active:bg-copper/80"
          onPress={handleUpdateEmail}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color="#0A0C10" />
          ) : (
            <Text className="text-obsidian font-monoBold uppercase tracking-widest">Request Transfer</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
