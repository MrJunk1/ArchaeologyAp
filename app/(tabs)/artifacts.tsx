import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { Plus, Search as SearchIcon, Filter, AlertTriangle, Database as DbIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BlueprintGrid } from '../../src/components/BlueprintGrid';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '../../src/lib/supabase';

type Artifact = {
  id: string;
  passport_id: string;
  name: string;
  type: string;
  condition: string;
  photos: string[] | null;
  created_at: string;
};

// ── Loading skeleton ────────────────────────────────────────
const ScanningIndicator = () => (
  <View className="flex-1 justify-center items-center py-20">
    <View className="bg-carbon border border-slate-wire px-8 py-6 rounded-sm items-center">
      <ActivityIndicator color="#48A89C" size="small" />
      <Text className="text-copper font-monoBold text-[10px] uppercase tracking-[0.4em] mt-4">
        Data Retrieving
      </Text>
      <View className="flex-row mt-3 gap-1">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
          <View
            key={i}
            className="w-2 h-1 bg-copper/30 rounded-full"
            style={{ opacity: 0.3 + (i * 0.08) }}
          />
        ))}
      </View>
      <Text className="text-slate-wire font-mono text-[8px] uppercase tracking-widest mt-3">
        Querying artifact ledger...
      </Text>
    </View>
  </View>
);

// ── Error state ─────────────────────────────────────────────
const ErrorBanner = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <View className="mx-6 bg-rust/5 border border-rust/30 p-5 rounded-sm mb-4">
    <View className="flex-row items-center mb-3">
      <AlertTriangle color="#C4553A" size={16} />
      <Text className="text-rust font-monoBold text-[10px] uppercase tracking-[0.2em] ml-3">
        Fetch Failure
      </Text>
    </View>
    <Text className="text-parchment font-mono text-[10px] mb-4 opacity-70">{message}</Text>
    <TouchableOpacity
      onPress={onRetry}
      className="bg-carbon border border-rust/30 py-2 items-center rounded-sm"
    >
      <Text className="text-rust font-mono text-[9px] uppercase tracking-widest">Retry Connection</Text>
    </TouchableOpacity>
  </View>
);

// ── Empty state ─────────────────────────────────────────────
const EmptyArchive = () => (
  <View className="flex-1 justify-center items-center py-20 px-10">
    <DbIcon color="#2A3040" size={48} />
    <Text className="text-bone font-display text-2xl mt-6 mb-2 text-center">Archive Empty</Text>
    <Text className="text-parchment font-mono text-[10px] uppercase tracking-widest text-center opacity-50">
      No artifact records found in the ledger.{'\n'}Digitize your first entry to begin.
    </Text>
  </View>
);

// ── Condition color helper ──────────────────────────────────
const conditionStyle = (c: string) => {
  switch (c) {
    case 'excellent':
    case 'good':
      return { bg: 'bg-copper/5 border-copper/30', text: 'text-copper' };
    case 'fair':
      return { bg: 'bg-gold/5 border-gold/30', text: 'text-gold' };
    default:
      return { bg: 'bg-rust/5 border-rust/30', text: 'text-rust' };
  }
};

export default function ArtifactsScreen() {
  const router = useRouter();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ───────────────────────────────────────────────
  const fetchArtifacts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('artifacts')
        .select('id, passport_id, name, type, condition, photos, created_at')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setArtifacts(data ?? []);
    } catch (e: any) {
      setError(e.message || 'Unknown connection error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ── Initial load + Realtime subscription ────────────────
  useEffect(() => {
    fetchArtifacts();

    const channel = supabase
      .channel('artifacts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artifacts' },
        (_payload) => {
          // Re-fetch the full list on any change for simplicity
          fetchArtifacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchArtifacts]);

  // ── Pull-to-refresh handler ─────────────────────────────
  const onRefresh = useCallback(() => {
    fetchArtifacts(true);
  }, [fetchArtifacts]);

  return (
    <View className="flex-1 bg-obsidian">
      <BlueprintGrid opacity={0.05} />

      {/* Header */}
      <View className="pt-16 px-6 mb-2">
        <View className="flex-row justify-between items-center mb-6 border-b border-slate-wire pb-4">
          <View>
            <Text className="text-bone font-display text-4xl uppercase tracking-tighter">Archive</Text>
            <Text className="text-parchment font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
              {loading ? 'Syncing...' : `${artifacts.length} Record${artifacts.length !== 1 ? 's' : ''} in Ledger`}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-carbon border border-copper p-3 rounded-sm active:bg-graphite"
            onPress={() => router.push('/artifact/add')}
          >
            <Plus color="#48A89C" size={20} />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 bg-carbon border border-slate-wire rounded-sm px-4 py-2 flex-row items-center">
            <SearchIcon color="#2A3040" size={16} />
            <Text className="text-slate-wire font-mono text-xs uppercase ml-2">Filter by ID or Name...</Text>
          </View>
          <TouchableOpacity className="bg-carbon border border-slate-wire p-2 rounded-sm items-center justify-center">
            <Filter color="#C4B9A8" size={18} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error banner */}
      {error && <ErrorBanner message={error} onRetry={() => fetchArtifacts()} />}

      {/* Content */}
      {loading ? (
        <ScanningIndicator />
      ) : (
        <FlatList
          data={artifacts}
          className="px-6"
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<EmptyArchive />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#48A89C"
              colors={['#48A89C']}
              progressBackgroundColor="#141820"
            />
          }
          renderItem={({ item, index }) => {
            const cStyle = conditionStyle(item.condition);
            const thumbUrl = item.photos && item.photos.length > 0 ? item.photos[0] : null;

            return (
              <Animated.View entering={FadeInDown.delay(80 * index).duration(500)}>
                <TouchableOpacity
                  className="bg-carbon border border-slate-wire mb-4 rounded-sm active:bg-graphite relative overflow-hidden"
                  onPress={() => router.push(`/artifact/${item.id}`)}
                >
                  {/* Optional thumbnail strip */}
                  {thumbUrl && (
                    <Image
                      source={{ uri: thumbUrl }}
                      className="w-full h-28"
                      style={{ resizeMode: 'cover', opacity: 0.6 }}
                    />
                  )}

                  <View className="p-5">
                    {/* Watermark index */}
                    <View className="absolute top-0 right-0 p-2 opacity-5">
                      <Text className="text-bone font-mono text-4xl">
                        {String(index + 1).padStart(2, '0')}
                      </Text>
                    </View>

                    {/* Passport ID + Condition */}
                    <View className="flex-row justify-between items-start mb-3">
                      <Text className="text-gold font-mono text-[10px] uppercase tracking-[0.2em] border-b border-gold/20 pb-0.5">
                        {item.passport_id}
                      </Text>
                      <View className={`px-2 py-0.5 rounded-sm border ${cStyle.bg}`}>
                        <Text className={`font-mono text-[9px] uppercase tracking-widest ${cStyle.text}`}>
                          {item.condition}
                        </Text>
                      </View>
                    </View>

                    {/* Name */}
                    <Text className="text-bone font-display text-2xl mb-2">{item.name}</Text>

                    {/* Type badge */}
                    <View className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-slate-wire mr-2" />
                      <Text className="text-parchment font-mono text-[10px] uppercase tracking-wider opacity-60">
                        Class: {item.type || 'unclassified'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          }}
        />
      )}
    </View>
  );
}
