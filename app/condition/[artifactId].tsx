import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { ArrowLeft, Save, Activity, ClipboardList, AlertCircle } from 'lucide-react-native';
import { BlueprintGrid } from '../../src/components/BlueprintGrid';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ConditionLogScreen() {
  const { artifactId } = useLocalSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  
  const [conditionBefore, setConditionBefore] = useState('good');
  const [conditionAfter, setConditionAfter] = useState('good');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!profile) {
      Alert.alert('Session Error', 'Unauthorized operator terminal.');
      return;
    }
    setLoading(true);
    
    try {
      const { error: logError } = await supabase.from('condition_logs').insert({
        artifact_id: artifactId,
        user_id: profile.id,
        condition_before: conditionBefore,
        condition_after: conditionAfter,
        notes,
      });

      if (logError) throw logError;

      const { error: artifactError } = await supabase
        .from('artifacts')
        .update({ condition: conditionAfter })
        .eq('id', artifactId);

      if (artifactError) throw artifactError;

      router.back();
    } catch (error: any) {
      Alert.alert('Log Failure', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-obsidian">
      <BlueprintGrid opacity={0.1} />
      
      <View className="pt-16 px-6 mb-8 flex-row justify-between items-center border-b border-slate-wire pb-6">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center bg-carbon border border-slate-wire rounded-sm"
        >
          <ArrowLeft color="#E8E0D4" size={20} />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-bone font-display text-2xl uppercase tracking-tighter">Condition Report</Text>
          <Text className="text-parchment font-mono text-[8px] uppercase tracking-[0.4em] opacity-60">Status Audit Protocol</Text>
        </View>
        <Activity color="#48A89C" size={20} className="opacity-50" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <View className="flex-row items-center mb-4 opacity-70">
            <ClipboardList size={14} color="#C4B9A8" className="mr-2" />
            <Text className="text-parchment font-monoBold text-[10px] uppercase tracking-[0.3em]">State Transition Analysis</Text>
          </View>

          <View className="bg-carbon border border-slate-wire p-5 rounded-sm mb-8">
            <Text className="text-slate-wire font-mono text-[9px] uppercase tracking-widest mb-3">Entrance Condition</Text>
            <View className="flex-row flex-wrap gap-2">
              {['excellent', 'good', 'fair', 'damaged', 'critical'].map(c => (
                <TouchableOpacity
                  key={`prev-${c}`}
                  onPress={() => setConditionBefore(c)}
                  className={`px-3 py-1.5 border rounded-sm ${conditionBefore === c ? 'bg-parchment/10 border-parchment' : 'bg-transparent border-slate-wire/30'}`}
                >
                  <Text className={`font-mono text-[9px] uppercase ${conditionBefore === c ? 'text-parchment' : 'text-slate-wire opacity-40'}`}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="h-[1px] w-full bg-slate-wire/20 my-6" />

            <Text className="text-copper font-monoBold text-[9px] uppercase tracking-widest mb-3">Exit / Current Condition</Text>
            <View className="flex-row flex-wrap gap-2">
              {['excellent', 'good', 'fair', 'damaged', 'critical'].map(c => (
                <TouchableOpacity
                  key={`after-${c}`}
                  onPress={() => setConditionAfter(c)}
                  className={`px-3 py-1.5 border rounded-sm ${conditionAfter === c ? (c === 'damaged' || c === 'critical' ? 'bg-rust/10 border-rust' : 'bg-copper/10 border-copper') : 'bg-transparent border-slate-wire/30'}`}
                >
                  <Text className={`font-monoBold text-[9px] uppercase ${conditionAfter === c ? (c === 'damaged' || c === 'critical' ? 'text-rust' : 'text-copper') : 'text-slate-wire opacity-40'}`}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <View className="flex-row items-center mb-4 opacity-70">
            <AlertCircle size={14} color="#C4B9A8" className="mr-2" />
            <Text className="text-parchment font-monoBold text-[10px] uppercase tracking-[0.3em]">Curatorial Annotations</Text>
          </View>
          
          <TextInput
            className="bg-carbon border border-slate-wire text-bone font-body p-5 rounded-sm h-40 text-lg"
            placeholder="Document structural anomalies or conservation measures..."
            placeholderTextColor="#2A3040"
            multiline
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
          />
        </Animated.View>
        
        <View className="h-20" />
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(300).duration(600)} className="p-6 border-t border-slate-wire bg-carbon/50">
        <TouchableOpacity 
          className="bg-carbon border border-copper py-5 items-center rounded-sm flex-row justify-center active:bg-graphite"
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#48A89C" />
          ) : (
            <>
              <Save color="#48A89C" size={18} className="mr-3" />
              <Text className="text-copper font-monoBold uppercase tracking-[0.2em]">Commit to Ledger</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

