import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { LogOut, Settings, User, Shield, Terminal, HardDrive } from 'lucide-react-native';
import { BlueprintGrid } from '../../src/components/BlueprintGrid';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();

  return (
    <View className="flex-1 bg-obsidian">
      <BlueprintGrid opacity={0.08} gridSize={50} />

      <ScrollView className="flex-1 px-6 pt-16" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-end mb-10 border-b border-slate-wire pb-6">
          <View>
            <Text className="text-bone font-display text-4xl uppercase tracking-tighter">Profile</Text>
            <Text className="text-parchment font-mono text-[9px] uppercase tracking-[0.4em] opacity-60">System Operator</Text>
          </View>
          <View className="w-12 h-12 bg-carbon border border-slate-wire items-center justify-center rounded-sm">
            <User color="#E8E0D4" size={24} />
          </View>
        </View>

        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <View className="bg-carbon border border-slate-wire p-8 rounded-sm relative overflow-hidden mb-10">
            <View className="absolute top-0 right-0 w-40 h-40 bg-copper opacity-5 rounded-bl-full translate-x-10 -translate-y-10 pointer-events-none" />
            
            <View className="flex-row items-center mb-6 opacity-60">
              <Shield size={12} color="#48A89C" className="mr-2" />
              <Text className="text-copper font-monoBold text-[10px] uppercase tracking-[0.3em]">Credentials Authenticated</Text>
            </View>

            <Text className="text-bone font-display text-3xl mb-1 uppercase tracking-tight">{profile?.full_name || 'Anonymous User'}</Text>
            <Text className="text-gold font-monoBold uppercase text-xs tracking-widest mb-6 border-b border-gold/20 self-start pb-0.5">
              Role: {profile?.role || 'Restricted Access'}
            </Text>
            
            <View className="flex-row items-center space-x-6 opacity-40">
              <View className="flex-row items-center mr-6">
                <Terminal size={12} color="#C4B9A8" className="mr-2" />
                <Text className="text-parchment font-mono text-[9px] tracking-widest uppercase">NODE-04</Text>
              </View>
              <View className="flex-row items-center">
                <HardDrive size={12} color="#C4B9A8" className="mr-2" />
                <Text className="text-parchment font-mono text-[9px] tracking-widest uppercase">ID: {profile?.id?.slice(0, 8) || '####'}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} className="space-y-4">
          <Text className="text-parchment font-monoBold text-[10px] uppercase tracking-[0.4em] mb-4 opacity-70">Configuration</Text>
          
          <TouchableOpacity className="flex-row items-center bg-carbon border border-slate-wire p-5 rounded-sm active:bg-graphite">
            <Settings color="#C4B9A8" size={18} className="mr-4 opacity-70" />
            <Text className="text-bone font-mono text-xs uppercase tracking-widest">Global Preferences</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center bg-carbon border border-rust/30 p-5 rounded-sm mt-4 active:bg-rust/5"
            onPress={signOut}
          >
            <LogOut color="#C4553A" size={18} className="mr-4 opacity-70" />
            <Text className="text-rust font-monoBold text-xs uppercase tracking-widest">Terminate Active Session</Text>
          </TouchableOpacity>
        </Animated.View>

        <View className="mt-20 opacity-20 pb-12 items-center">
          <View className="h-[1px] w-12 bg-slate-wire mb-4" />
          <Text className="text-parchment font-mono text-[8px] uppercase tracking-[0.6em]">
            Artifacta End-to-End // Secure Connection
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

