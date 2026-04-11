import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { LayoutDashboard, Plus, History } from 'lucide-react-native';
import { BlueprintGrid } from '../../src/components/BlueprintGrid';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({ total: 0, alerts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    const channel = supabase
      .channel('dashboard-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'artifacts' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const { count: total, error: totalError } = await supabase
        .from('artifacts')
        .select('*', { count: 'exact', head: true });
        
      const { count: alerts, error: alertsError } = await supabase
        .from('artifacts')
        .select('*', { count: 'exact', head: true })
        .in('condition', ['damaged', 'critical']);
        
      if (totalError || alertsError) throw new Error('Fetch failed');
      
      setStats({ total: total || 0, alerts: alerts || 0 });
    } catch (e) {
      console.warn('Failed to fetch dashboard metrics:', e);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View className="flex-1 bg-obsidian">
      <BlueprintGrid opacity={0.08} />
      
      <ScrollView className="flex-1 pt-12 px-6">
        <Animated.View 
          entering={FadeInDown.delay(100).duration(600)}
          className="flex-row justify-between items-end mb-8 border-b border-slate-wire pb-4"
        >
          <View>
            <Text className="text-parchment font-mono text-[10px] uppercase tracking-[0.2em] mb-1">
              Terminal: ARCH-SYS-01 // Operator: {profile?.role || 'Guest'}
            </Text>
            <Text className="text-bone font-display text-4xl uppercase tracking-tighter">
              {profile?.full_name?.split(' ')[0] || 'My'} Base
            </Text>
          </View>
          <View className="h-12 w-12 bg-carbon border border-slate-wire items-center justify-center rounded-sm">
             <LayoutDashboard color="#E8E0D4" size={24} />
          </View>
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <Text className="text-parchment font-monoBold text-[10px] uppercase tracking-[0.3em] mb-4 opacity-70">
            Current Inventory Status
          </Text>
          
          <View className="flex-row gap-4 mb-8">
            <View className="flex-1 bg-carbon border border-slate-wire p-5 rounded-sm relative overflow-hidden">
              <View className="absolute top-0 right-0 w-12 h-12 bg-copper/5 rounded-bl-3xl border-l border-b border-copper/10" />
              {loading ? (
                 <ActivityIndicator color="#48A89C" className="self-start mb-2" />
              ) : (
                <Text className="text-bone font-mono text-4xl mb-1 tracking-tighter">{String(stats.total).padStart(2, '0')}</Text>
              )}
              <Text className="text-parchment font-body text-xs uppercase tracking-wider opacity-60">Verified Records</Text>
            </View>
            <View className="flex-1 bg-carbon border border-slate-wire p-5 rounded-sm relative overflow-hidden">
              <View className="absolute top-0 right-0 w-12 h-12 bg-rust/5 rounded-bl-3xl border-l border-b border-rust/10" />
              {loading ? (
                 <ActivityIndicator color="#C4553A" className="self-start mb-2" />
              ) : (
                <Text className="text-rust font-mono text-4xl mb-1 tracking-tighter">{String(stats.alerts).padStart(2, '0')}</Text>
              )}
              <Text className="text-parchment font-body text-xs uppercase tracking-wider opacity-60">Active Alerts</Text>
            </View>
          </View>
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <Text className="text-parchment font-monoBold text-[10px] uppercase tracking-[0.3em] mb-4 opacity-70">
            Strategic Operations
          </Text>
          
          <View className="gap-4">
            <TouchableOpacity 
              onPress={() => router.push('/artifact/add')}
              className="flex-row items-center bg-carbon border border-slate-wire p-5 rounded-sm group active:bg-graphite"
            >
               <View className="bg-copper/10 p-3 rounded-sm mr-4 border border-copper/20">
                 <Plus color="#48A89C" size={24} />
               </View>
               <View className="flex-1">
                 <Text className="text-bone font-monoBold text-sm uppercase tracking-widest mb-1">Digitize Artifact</Text>
                 <Text className="text-parchment font-body text-[11px] opacity-60">Initialize new passport and unique identifier</Text>
               </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/scan')}
              className="flex-row items-center bg-carbon border border-slate-wire p-5 rounded-sm active:bg-graphite"
            >
               <View className="bg-gold/10 p-3 rounded-sm mr-4 border border-gold/20">
                 <History color="#B8963E" size={24} />
               </View>
               <View className="flex-1">
                 <Text className="text-bone font-monoBold text-sm uppercase tracking-widest mb-1">Condition Audit</Text>
                 <Text className="text-parchment font-body text-[11px] opacity-60">Update temporal degradation metrics</Text>
               </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(400).duration(600)}
          className="mt-16 opacity-20 pb-12 items-center"
        >
          <View className="h-[1px] w-12 bg-slate-wire mb-4" />
          <Text className="text-parchment font-mono text-[8px] uppercase tracking-[0.5em]">
            Artifacta Protocol // V1.0.0 // {new Date().getFullYear()}
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

