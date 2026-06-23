import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ArrowLeft, Mail, KeyRound } from 'lucide-react-native';
import { BlueprintGrid } from '../../src/components/BlueprintGrid';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-obsidian">
      <BlueprintGrid opacity={0.05} gridSize={40} />
      
      <View className="flex-row items-center pt-16 pb-6 px-6 border-b border-slate-wire bg-carbon/50">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-4">
          <ArrowLeft color="#E8E0D4" size={24} />
        </TouchableOpacity>
        <Text className="text-bone font-display text-3xl uppercase tracking-tighter">Security Settings</Text>
      </View>

      <View className="p-6 space-y-4 shadow-xl">
        <Link href="/profile/update-email" asChild>
          <TouchableOpacity className="flex-row items-center bg-carbon border border-slate-wire p-5 rounded-sm active:bg-graphite">
            <Mail color="#48A89C" size={20} className="mr-4" />
            <View>
              <Text className="text-bone font-mono text-sm uppercase tracking-widest mb-1">Update Email Address</Text>
              <Text className="text-parchment font-mono text-[10px] tracking-widest opacity-60 uppercase">Modify your operator ID</Text>
            </View>
          </TouchableOpacity>
        </Link>

        <Link href="/profile/update-password" asChild>
          <TouchableOpacity className="flex-row items-center bg-carbon border border-slate-wire p-5 rounded-sm active:bg-graphite mt-4">
            <KeyRound color="#48A89C" size={20} className="mr-4" />
            <View>
               <Text className="text-bone font-mono text-sm uppercase tracking-widest mb-1">Change Passcode</Text>
               <Text className="text-parchment font-mono text-[10px] tracking-widest opacity-60 uppercase">Update your security token</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
