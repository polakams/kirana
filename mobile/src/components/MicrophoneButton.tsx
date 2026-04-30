import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface MicrophoneButtonProps {
  isListening: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function MicrophoneButton({ isListening, onPress, disabled }: MicrophoneButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isListening) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.25, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [isListening, pulseAnim]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <View className="items-center justify-center">
      {isListening && (
        <Animated.View
          style={{ transform: [{ scale: pulseAnim }] }}
          className="absolute w-32 h-32 rounded-full bg-red-100 opacity-50"
        />
      )}
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        className={`w-28 h-28 rounded-full items-center justify-center shadow-lg ${
          isListening ? 'bg-red-500' : disabled ? 'bg-gray-300' : 'bg-primary'
        }`}
      >
        <Ionicons
          name={isListening ? 'stop' : 'mic'}
          size={44}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}
