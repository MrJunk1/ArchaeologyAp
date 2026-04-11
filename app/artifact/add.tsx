import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../src/lib/supabase';
import { generatePassportId } from '../../src/lib/utils';
import {
  Camera, Image as ImageIcon, Save, ArrowLeft,
  Fingerprint, Database, MapPin, Calendar, User,
  Layers, X, AlertTriangle,
} from 'lucide-react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { BlueprintGrid } from '../../src/components/BlueprintGrid';
import Animated, { FadeInDown } from 'react-native-reanimated';

// ── Field label component ───────────────────────────────────
const FieldLabel = ({ icon: Icon, color, label }: { icon: any; color: string; label: string }) => (
  <View className="flex-row items-center mb-3">
    <Icon size={12} color={color} style={{ opacity: 0.5, marginRight: 6 }} />
    <Text className="text-parchment font-monoBold text-[10px] uppercase tracking-[0.3em] opacity-80">
      {label}
    </Text>
  </View>
);

// ── Error toast ─────────────────────────────────────────────
const ErrorToast = ({ message }: { message: string }) => (
  <View className="bg-rust/10 border border-rust/30 px-4 py-3 rounded-sm mb-6 flex-row items-center">
    <AlertTriangle color="#C4553A" size={14} />
    <Text className="text-rust font-mono text-[10px] ml-3 flex-1">{message}</Text>
  </View>
);

export default function AddArtifactScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();

  // ── Form state ──────────────────────────────────────────
  const [name, setName] = useState('');
  const [type, setType] = useState('other');
  const [condition, setCondition] = useState('good');
  const [creator, setCreator] = useState('');
  const [dateCreated, setDateCreated] = useState('');
  const [origin, setOrigin] = useState('');
  const [location, setLocation] = useState('');
  const [materials, setMaterials] = useState('');
  const [description, setDescription] = useState('');

  // ── Image state ─────────────────────────────────────────
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Permissions helper ──────────────────────────────────
  const requestMediaPermission = async (type: 'camera' | 'gallery') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required for optical capture.');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Media library access is required for source import.');
        return false;
      }
    }
    return true;
  };

  // ── Pick image (camera or gallery) ──────────────────────
  const pickImage = async (source: 'camera' | 'gallery') => {
    const allowed = await requestMediaPermission(source);
    if (!allowed) return;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    };

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets.length > 0) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  // ── Remove image ────────────────────────────────────────
  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Upload images to Supabase Storage ───────────────────
  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const uri of images) {
      const ext = uri.split('.').pop() ?? 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `artifacts/${fileName}`;

      // Read file as blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Convert blob to ArrayBuffer for Supabase upload
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('artifact-media')
        .upload(filePath, arrayBuffer, {
          contentType: `image/${ext}`,
          upsert: false,
        });

      if (uploadError) {
        console.warn('Upload failed for', fileName, uploadError.message);
        continue; // Skip failed uploads, continue with rest
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('artifact-media')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        urls.push(urlData.publicUrl);
      }
    }

    return urls;
  };

  // ── Save artifact ───────────────────────────────────────
  const handleSave = async () => {
    setFormError(null);

    if (!name.trim()) {
      setFormError('Nomenclature designation is required.');
      return;
    }
    if (!user || !profile) {
      setFormError('Authentication expired. Please re-authenticate.');
      return;
    }

    setSaving(true);

    try {
      // 1. Upload images if any
      let photoUrls: string[] = [];
      if (images.length > 0) {
        setUploading(true);
        photoUrls = await uploadImages();
        setUploading(false);
      }

      // 2. Generate passport ID
      const passportId = generatePassportId();

      // 3. Parse materials into array
      const materialsArray = materials
        .split(',')
        .map(m => m.trim())
        .filter(m => m.length > 0);

      // 4. Insert artifact
      const { error } = await supabase.from('artifacts').insert({
        passport_id: passportId,
        name: name.trim(),
        type,
        condition,
        creator: creator.trim() || null,
        date_created: dateCreated.trim() || null,
        origin: origin.trim() || null,
        location: location.trim() || null,
        description: description.trim() || null,
        materials: materialsArray.length > 0 ? materialsArray : null,
        photos: photoUrls.length > 0 ? photoUrls : null,
        qr_code_data: passportId,
        user_id: profile.id,
      });

      if (error) throw error;
      router.back();
    } catch (error: any) {
      setFormError(error.message || 'Record insertion failed.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-obsidian">
      <BlueprintGrid opacity={0.08} gridSize={40} />

      {/* Header */}
      <View className="pt-16 px-6 mb-4 flex-row items-center border-b border-slate-wire pb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center bg-carbon border border-slate-wire rounded-sm mr-4"
        >
          <ArrowLeft color="#E8E0D4" size={20} />
        </TouchableOpacity>
        <View>
          <Text className="text-bone font-display text-3xl uppercase tracking-tighter">Digitize Record</Text>
          <Text className="text-parchment font-mono text-[9px] uppercase tracking-[0.3em] opacity-60">New Entry Protocol</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Error */}
        {formError && <ErrorToast message={formError} />}

        {/* ── Media Section ──────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <View className="bg-carbon border border-slate-wire p-6 rounded-sm mb-6 relative overflow-hidden">
            <View className="absolute top-0 left-0 w-12 h-12 bg-copper/5 rounded-br-3xl" />

            <View className="flex-row items-center justify-around mb-4">
              <TouchableOpacity
                className="items-center px-4"
                onPress={() => pickImage('camera')}
              >
                <Camera color="#48A89C" size={28} style={{ marginBottom: 8 }} />
                <Text className="text-copper font-monoBold text-[10px] uppercase tracking-widest">Optical Capture</Text>
              </TouchableOpacity>
              <View className="h-10 w-[1px] bg-slate-wire/30" />
              <TouchableOpacity
                className="items-center px-4"
                onPress={() => pickImage('gallery')}
              >
                <ImageIcon color="#C4B9A8" size={28} style={{ marginBottom: 8 }} />
                <Text className="text-parchment font-mono text-[10px] uppercase tracking-widest opacity-60">Source Import</Text>
              </TouchableOpacity>
            </View>

            {/* Image thumbnails */}
            {images.length > 0 && (
              <View className="flex-row flex-wrap gap-3 mt-2">
                {images.map((uri, idx) => (
                  <View key={idx} className="relative">
                    <Image
                      source={{ uri }}
                      className="w-20 h-20 rounded-sm border border-slate-wire"
                      style={{ resizeMode: 'cover' }}
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-rust w-5 h-5 rounded-full items-center justify-center"
                    >
                      <X color="#0A0C10" size={10} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {images.length > 0 && (
              <Text className="text-parchment font-mono text-[8px] uppercase tracking-widest mt-3 opacity-40">
                {images.length} media asset{images.length > 1 ? 's' : ''} staged for upload
              </Text>
            )}
          </View>
        </Animated.View>

        {/* ── Form fields ────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>

          {/* Name */}
          <View className="mb-6">
            <FieldLabel icon={Fingerprint} color="#48A89C" label="Nomenclature Designation" />
            <TextInput
              className="bg-carbon border border-slate-wire text-bone font-body text-xl p-4 rounded-sm"
              placeholder="Artifact Name (e.g. Bronze Celt)"
              placeholderTextColor="#2A3040"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Creator */}
          <View className="mb-6">
            <FieldLabel icon={User} color="#B8963E" label="Creator / Culture" />
            <TextInput
              className="bg-carbon border border-slate-wire text-bone font-body text-lg p-4 rounded-sm"
              placeholder="Unknown Artisan, Mayan, etc."
              placeholderTextColor="#2A3040"
              value={creator}
              onChangeText={setCreator}
            />
          </View>

          {/* Date + Origin (side-by-side) */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
              <FieldLabel icon={Calendar} color="#B8963E" label="Chronology" />
              <TextInput
                className="bg-carbon border border-slate-wire text-bone font-mono text-sm p-4 rounded-sm"
                placeholder="c. 1350 BCE"
                placeholderTextColor="#2A3040"
                value={dateCreated}
                onChangeText={setDateCreated}
              />
            </View>
            <View className="flex-1">
              <FieldLabel icon={MapPin} color="#B8963E" label="Origin" />
              <TextInput
                className="bg-carbon border border-slate-wire text-bone font-mono text-sm p-4 rounded-sm"
                placeholder="Lower Egypt"
                placeholderTextColor="#2A3040"
                value={origin}
                onChangeText={setOrigin}
              />
            </View>
          </View>

          {/* Location */}
          <View className="mb-6">
            <FieldLabel icon={MapPin} color="#C4B9A8" label="Current Storage Location" />
            <TextInput
              className="bg-carbon border border-slate-wire text-bone font-body text-lg p-4 rounded-sm"
              placeholder="Vault A, Case 14"
              placeholderTextColor="#2A3040"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Materials (comma-separated) */}
          <View className="mb-6">
            <FieldLabel icon={Layers} color="#48A89C" label="Material Composition" />
            <TextInput
              className="bg-carbon border border-slate-wire text-bone font-mono text-sm p-4 rounded-sm"
              placeholder="bronze, leather, obsidian (comma-separated)"
              placeholderTextColor="#2A3040"
              value={materials}
              onChangeText={setMaterials}
            />
          </View>

          {/* Type selector */}
          <View className="mb-6">
            <FieldLabel icon={Database} color="#B8963E" label="Material Classification" />
            <View className="flex-row flex-wrap gap-2">
              {['painting', 'sculpture', 'ceramic', 'textile', 'metal', 'stone', 'manuscript', 'other'].map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  className={`px-4 py-2 border rounded-sm ${type === t ? 'bg-copper/10 border-copper' : 'bg-carbon/50 border-slate-wire/40'}`}
                >
                  <Text className={`font-mono text-[11px] uppercase tracking-wider ${type === t ? 'text-copper' : 'text-slate-wire'}`}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Condition selector */}
          <View className="mb-6">
            <Text className="text-parchment font-monoBold text-[10px] uppercase tracking-[0.3em] mb-4 opacity-80">
              Initial Temporal Stability
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {['excellent', 'good', 'fair', 'damaged', 'critical'].map(c => {
                const isNeg = c === 'damaged' || c === 'critical';
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCondition(c)}
                    className={`px-4 py-3 border rounded-sm flex-1 items-center min-w-[90px] ${
                      condition === c
                        ? (isNeg ? 'bg-rust/10 border-rust' : 'bg-copper/10 border-copper')
                        : 'bg-carbon/30 border-slate-wire/30'
                    }`}
                  >
                    <Text className={`font-monoBold text-[10px] uppercase tracking-widest ${
                      condition === c
                        ? (isNeg ? 'text-rust' : 'text-copper')
                        : 'text-slate-wire opacity-40'
                    }`}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Description */}
          <View className="mb-12">
            <FieldLabel icon={Fingerprint} color="#C4B9A8" label="Curatorial Description" />
            <TextInput
              className="bg-carbon border border-slate-wire text-bone font-body text-base p-4 rounded-sm h-28"
              placeholder="Physical characteristics, historical context, notable features..."
              placeholderTextColor="#2A3040"
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

        </Animated.View>
        <View className="h-8" />
      </ScrollView>

      {/* ── Save button ──────────────────────────────────── */}
      <Animated.View entering={FadeInDown.delay(300).duration(600)} className="p-6 border-t border-slate-wire bg-carbon/50">
        <TouchableOpacity
          className="bg-copper py-5 items-center rounded-sm border border-copper/50 flex-row justify-center active:bg-copper/80"
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="#0A0C10" size="small" />
              <Text className="text-obsidian font-monoBold uppercase tracking-[0.2em] ml-3">
                {uploading ? 'Uploading Media...' : 'Committing Record...'}
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center">
              <Save color="#0A0C10" size={20} style={{ marginRight: 10 }} />
              <Text className="text-obsidian font-monoBold uppercase tracking-[0.2em]">Generate Digital Soul</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
