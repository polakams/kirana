import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <Ionicons name={icon} size={64} color="#CBD5E1" />
      <Text className="text-gray-400 text-lg font-semibold mt-4 text-center">{title}</Text>
      {subtitle && (
        <Text className="text-gray-400 text-sm mt-2 text-center">{subtitle}</Text>
      )}
    </View>
  );
}
