import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { ArrowLeft, Clock, MapPin, User, ShieldCheck, Database, Layers, AlertTriangle } from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { BlueprintGrid } from '../../src/components/BlueprintGrid';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

export default function ArtifactDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [artifact, setArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArtifact();
  }, [id]);

  const fetchArtifact = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('artifacts')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      setArtifact(data);
    } catch (e: any) {
      setError(e.message || 'Failed to retrieve record');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ───────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 bg-obsidian justify-center items-center">
        <BlueprintGrid opacity={0.05} />
        <View className="bg-carbon border border-slate-wire px-8 py-6 rounded-sm items-center">
          <ActivityIndicator color="#48A89C" />
          <Text className="text-copper font-monoBold text-[10px] uppercase tracking-[0.4em] mt-4">
            Decrypting Passport
          </Text>
        </View>
      </View>
    );
  }

  // ── Error / not found state ─────────────────────────────
  if (error || !artifact) {
    return (
      <View className="flex-1 bg-obsidian pt-16 px-6">
        <BlueprintGrid opacity={0.05} />
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 justify-center items-center bg-carbon border border-slate-wire rounded-sm mb-8"
        >
          <ArrowLeft color="#E8E0D4" size={24} />
        </TouchableOpacity>

        <View className="bg-rust/5 border border-rust/30 p-6 rounded-sm items-center">
          <AlertTriangle color="#C4553A" size={32} />
          <Text className="text-bone font-display text-xl mt-4 mb-2">Record Inaccessible</Text>
          <Text className="text-parchment font-mono text-[10px] uppercase text-center tracking-widest opacity-60 mb-4">
            {error || 'The requested artifact passport could not be located in the ledger.'}
          </Text>
          <TouchableOpacity onPress={fetchArtifact} className="bg-carbon border border-rust/30 px-6 py-2 rounded-sm">
            <Text className="text-rust font-mono text-[9px] uppercase tracking-widest">Retry Query</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Photo header ────────────────────────────────────────
  const heroImage = artifact.photos && artifact.photos.length > 0
    ? artifact.photos[0]
    : null;

  return (
    <View className="flex-1 bg-obsidian">
      <BlueprintGrid opacity={0.12} gridSize={60} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Passport Header */}
        <Animated.View
          entering={FadeIn.duration(800)}
          className="pt-16 pb-10 px-8 bg-carbon border-b border-slate-wire shadow-2xl relative"
        >
          <View className="absolute top-0 right-0 w-48 h-48 bg-cyan-blueprint opacity-10 rounded-bl-full pointer-events-none translate-x-12 -translate-y-12" />

          <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 justify-center items-center bg-obsidian border border-slate-wire rounded-sm mb-8"
          >
            <ArrowLeft color="#E8E0D4" size={24} />
          </TouchableOpacity>

          {/* Hero image */}
          {heroImage && (
            <View className="mb-6 rounded-sm overflow-hidden border border-slate-wire/30">
              <Image
                source={{ uri: heroImage }}
                className="w-full h-48"
                style={{ resizeMode: 'cover' }}
              />
            </View>
          )}

          <View className="items-center">
            <View className="flex-row items-center mb-6 opacity-40">
              <View className="h-[1px] w-8 bg-slate-wire" />
              <Text className="mx-4 text-parchment font-mono text-[9px] uppercase tracking-[0.4em]">Verified Record</Text>
              <View className="h-[1px] w-8 bg-slate-wire" />
            </View>

            <Text className="text-bone font-display text-5xl text-center mb-4 tracking-tighter uppercase leading-tight">
              {artifact.name}
            </Text>

            <View className="bg-obsidian border border-gold/30 px-6 py-2 rounded-sm rotate-1">
              <Text className="text-gold font-monoBold text-xl tracking-[0.15em]">{artifact.passport_id}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Core Identity Section */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          className="p-8"
        >
          <View className="flex-row items-stretch mb-10">
            <View className="flex-1 pr-6 justify-between">
              <View>
                <Text className="text-parchment font-mono text-[10px] uppercase tracking-[0.2em] mb-2 opacity-50">Core Classification</Text>
                <Text className="text-bone font-body text-2xl capitalize mb-6">{artifact.type || 'Undefined'}</Text>
              </View>

              <View>
                <Text className="text-parchment font-mono text-[10px] uppercase tracking-[0.2em] mb-3 opacity-50">Temporal Stability</Text>
                <View className={`px-4 py-2 self-start rounded-sm border ${
                  artifact.condition === 'good' || artifact.condition === 'excellent'
                    ? 'bg-copper/5 border-copper/40'
                    : artifact.condition === 'fair'
                    ? 'bg-gold/5 border-gold/40'
                    : 'bg-rust/5 border-rust/40'
                }`}>
                  <Text className={`font-monoBold text-xs uppercase tracking-[0.2em] ${
                    artifact.condition === 'good' || artifact.condition === 'excellent'
                      ? 'text-copper'
                      : artifact.condition === 'fair'
                      ? 'text-gold'
                      : 'text-rust'
                  }`}>
                    {artifact.condition || 'Unknown'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Digital Identity QR */}
            <View className="w-1/3 items-end">
              <View className="p-3 bg-bone rounded-sm shadow-inner rotate-3 border-2 border-slate-wire/20">
                <QRCode
                  value={`artifact:${artifact.passport_id || artifact.id}`}
                  size={100}
                  color="#0A0C10"
                  backgroundColor="#E8E0D4"
                />
              </View>
              <Text className="text-slate-wire font-mono text-[7px] uppercase mt-3 w-full text-center tracking-[0.3em] opacity-40">Identity Validation</Text>
            </View>
          </View>

          {/* Archeological Provenance */}
          <Text className="text-parchment font-monoBold text-[10px] uppercase tracking-[0.4em] mb-6 opacity-80">
            Provenance Metadirectory
          </Text>

          <View className="bg-carbon border border-slate-wire rounded-sm mb-6 overflow-hidden">
            {[
              { label: 'Chronology', value: artifact.date_created, icon: Clock },
              { label: 'Geospatial Origin', value: artifact.origin, icon: MapPin },
              { label: 'Cultural Context', value: artifact.creator, icon: User },
              { label: 'Storage Node', value: artifact.location || 'Central Vault A', icon: Database },
            ].map((item, idx) => (
              <View key={idx} className={`p-5 flex-row items-center ${idx !== 3 ? 'border-b border-slate-wire/50' : ''}`}>
                <item.icon color="#B8963E" size={18} style={{ marginRight: 16, opacity: 0.7 }} />
                <View>
                  <Text className="text-parchment font-mono text-[9px] uppercase tracking-[0.1em] mb-1 opacity-50">{item.label}</Text>
                  <Text className="text-bone font-body text-lg italic">{item.value || 'Unregistered'}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Materials */}
          {artifact.materials && artifact.materials.length > 0 && (
            <View className="mb-8">
              <View className="flex-row items-center mb-3">
                <Layers color="#48A89C" size={14} style={{ marginRight: 8, opacity: 0.5 }} />
                <Text className="text-parchment font-monoBold text-[10px] uppercase tracking-[0.3em] opacity-80">
                  Material Composition
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {artifact.materials.map((m: string, idx: number) => (
                  <View key={idx} className="bg-carbon border border-slate-wire/40 px-3 py-1.5 rounded-sm">
                    <Text className="text-parchment font-mono text-[10px] uppercase tracking-wider">{m}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Description */}
          {artifact.description && (
            <View className="mb-8 bg-carbon border border-slate-wire/30 p-5 rounded-sm">
              <Text className="text-parchment font-mono text-[9px] uppercase tracking-[0.2em] mb-2 opacity-50">
                Curatorial Notes
              </Text>
              <Text className="text-bone font-body text-base leading-relaxed italic">
                {artifact.description}
              </Text>
            </View>
          )}

          {/* Photo gallery */}
          {artifact.photos && artifact.photos.length > 1 && (
            <View className="mb-8">
              <Text className="text-parchment font-monoBold text-[10px] uppercase tracking-[0.3em] mb-4 opacity-80">
                Media Archive ({artifact.photos.length} assets)
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {artifact.photos.map((url: string, idx: number) => (
                  <View key={idx} className="mr-3 rounded-sm overflow-hidden border border-slate-wire/30">
                    <Image
                      source={{ uri: url }}
                      className="w-32 h-24"
                      style={{ resizeMode: 'cover' }}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.push(`/condition/${artifact.id}`)}
            className="bg-copper py-5 items-center rounded-sm border border-copper/50 flex-row justify-center active:bg-copper/80"
          >
            <ShieldCheck color="#0A0C10" size={20} style={{ marginRight: 10 }} />
            <Text className="text-obsidian font-monoBold uppercase tracking-[0.2em]">Audit Condition Status</Text>
          </TouchableOpacity>
        </Animated.View>

        <View className="h-12" />
      </ScrollView>
    </View>
  );
}
