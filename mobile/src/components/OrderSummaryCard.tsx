import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Order } from '../models/order';

const CHANNEL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  whatsapp: 'logo-whatsapp',
  sms: 'chatbubble',
  email: 'mail',
  copy: 'copy',
};

interface OrderSummaryCardProps {
  order: Order;
  onPress: () => void;
  onResend?: () => void;
}

export function OrderSummaryCard({ order, onPress, onResend }: OrderSummaryCardProps) {
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
  const time = new Date(order.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const statusColor = order.status === 'sent'
    ? 'text-green-600'
    : order.status === 'failed'
    ? 'text-red-600'
    : 'text-gray-400';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white rounded-xl px-4 py-3 mb-3 shadow-sm"
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-gray-800 font-semibold text-base">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </Text>
          <Text className="text-gray-500 text-sm mt-0.5">
            {date} at {time}
          </Text>
          <Text className="text-gray-600 text-sm mt-1" numberOfLines={1}>
            {order.items.map((i) => i.name).join(', ')}
          </Text>
        </View>
        <View className="items-end gap-1">
          <View className="flex-row items-center gap-1">
            <Text className={`text-xs font-medium capitalize ${statusColor}`}>
              {order.status}
            </Text>
            {order.sentVia && (
              <Ionicons
                name={CHANNEL_ICONS[order.sentVia] ?? 'send'}
                size={14}
                color="#666"
              />
            )}
          </View>
          {onResend && (
            <TouchableOpacity onPress={onResend} className="flex-row items-center gap-1 mt-1">
              <Ionicons name="refresh" size={14} color="#2E7D32" />
              <Text className="text-primary text-xs">Resend</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
