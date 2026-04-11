import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { ScanLine, Crosshair, AlertTriangle } from 'lucide-react-native';
import { BlueprintGrid } from '../../src/components/BlueprintGrid';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  if (!permission) {
    return <View className="flex-1 bg-obsidian" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-obsidian justify-center items-center px-10">
        <BlueprintGrid opacity={0.1} />
        <View className="bg-rust/10 p-6 rounded-full mb-8 border border-rust/20">
          <AlertTriangle color="#C4553A" size={48} />
        </View>
        <Text className="text-bone font-display text-3xl mb-4 text-center">Optical Access Locked</Text>
        <Text className="text-parchment font-body text-center mb-10 opacity-60 leading-relaxed">
          The Curatorial Terminal requires camera authorization to decrypt physical Artifact Passports.
        </Text>
        <TouchableOpacity 
          className="bg-copper py-5 px-10 rounded-sm border border-copper/50 active:bg-copper/80 w-full"
          onPress={requestPermission}
        >
          <Text className="text-obsidian font-monoBold uppercase tracking-[0.2em] text-center">Authorize Capture</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    // Assuming data is the artifact ID
    router.push(`/artifact/${data}`);
  };

  return (
    <View className="flex-1 bg-obsidian">
      <CameraView 
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      
      {/* HUD Overlay */}
      <View className="absolute inset-0">
        <View className="h-1/4 bg-obsidian/80 border-b border-copper/20 pt-16 px-8 flex-row justify-between items-start">
          <View>
            <Text className="text-copper font-monoBold text-[10px] uppercase tracking-[0.4em]">Optical Input Active</Text>
            <Text className="text-parchment font-mono text-[8px] uppercase tracking-[0.2em] opacity-40">Decrypting Passport Metadata</Text>
          </View>
          <Crosshair color="#48A89C" size={16} className="opacity-50" />
        </View>

        <View className="flex-1 items-center justify-center relative">
          <View className="w-64 h-64 border border-copper/30 rounded-xl">
             {/* Scanner line animation placeholder via simple view */}
             <View className="absolute top-0 left-0 right-0 h-[2px] bg-copper/40 shadow-xl" />
          </View>
        </View>

        <View className="h-1/4 bg-obsidian/80 border-t border-copper/20 pb-12 items-center justify-center">
          <View className="flex-row items-center bg-carbon/80 border border-slate-wire px-6 py-3 rounded-full">
            <ScanLine color="#48A89C" size={18} className="mr-3" />
            <Text className="text-bone font-mono text-[10px] uppercase tracking-widest leading-none">Align unique QR identifier</Text>
          </View>
        </View>
      </View>

      {scanned && (
        <TouchableOpacity 
          className="absolute bottom-32 self-center bg-copper px-8 py-4 rounded-sm shadow-2xl"
          onPress={() => setScanned(false)}
        >
          <Text className="text-obsidian font-monoBold uppercase tracking-widest text-xs">Reset Scanner</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

