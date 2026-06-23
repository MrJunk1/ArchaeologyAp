import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react-native';

export type StatusType = 'success' | 'error' | 'info';

interface StatusBannerProps {
  type: StatusType;
  message: string;
  visible: boolean;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

const CONFIG: Record<StatusType, { borderColor: string; bgColor: string; iconColor: string; textColor: string; label: string }> = {
  success: {
    borderColor: '#48A89C',
    bgColor: 'rgba(72, 168, 156, 0.08)',
    iconColor: '#48A89C',
    textColor: '#48A89C',
    label: 'CONFIRMED',
  },
  error: {
    borderColor: '#C4553A',
    bgColor: 'rgba(196, 85, 58, 0.08)',
    iconColor: '#C4553A',
    textColor: '#C4553A',
    label: 'ERROR',
  },
  info: {
    borderColor: '#B8963E',
    bgColor: 'rgba(184, 150, 62, 0.08)',
    iconColor: '#B8963E',
    textColor: '#B8963E',
    label: 'NOTICE',
  },
};

const ICONS: Record<StatusType, React.ComponentType<any>> = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
};

export function StatusBanner({ type, message, visible, onDismiss, autoDismissMs = 6000 }: StatusBannerProps) {
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (autoDismissMs > 0 && onDismiss) {
        const timer = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }).start(() => onDismiss());
        }, autoDismissMs);
        return () => clearTimeout(timer);
      }
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  const cfg = CONFIG[type];
  const Icon = ICONS[type];

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        borderColor: cfg.borderColor,
        backgroundColor: cfg.bgColor,
        borderWidth: 1,
        borderRadius: 2,
        padding: 14,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}
    >
      <Icon color={cfg.iconColor} size={18} style={{ marginRight: 10, marginTop: 1 }} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'IBMPlexMono-SemiBold',
            fontSize: 9,
            letterSpacing: 2,
            color: cfg.textColor,
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          {cfg.label}
        </Text>
        <Text
          style={{
            fontFamily: 'IBMPlexMono-Regular',
            fontSize: 12,
            letterSpacing: 0.5,
            color: '#C4B9A8',
            lineHeight: 18,
          }}
        >
          {message}
        </Text>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X color="#2A3040" size={16} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
