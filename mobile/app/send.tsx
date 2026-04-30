import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SendChannelPicker } from '../src/components/SendChannelPicker';
import { useOrderHistory } from '../src/hooks/useOrderHistory';
import { useSettings } from '../src/hooks/useSettings';
import { sendOrder } from '../src/services/orderSender';
import { formatOrderAsText } from '../src/services/orderFormatter';
import type { Order, SendChannel } from '../src/models/order';

export default function SendScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { orders, addOrUpdate } = useOrderHistory();
  const { settings } = useSettings();
  const [order, setOrder] = useState<Order | null>(null);
  const [channel, setChannel] = useState<SendChannel>('whatsapp');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const found = orders.find((o) => o.id === orderId);
    if (found) {
      setOrder(found);
      if (settings?.defaultSendChannel) setChannel(settings.defaultSendChannel);
    }
  }, [orders, orderId, settings]);

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#2E7D32" />
      </View>
    );
  }

  const handleSend = async () => {
    if (!order.storeContact.phone && channel !== 'email' && channel !== 'copy') {
      Alert.alert('No phone number', 'Please add a store phone number in Settings.');
      return;
    }
    setSending(true);
    try {
      const result = await sendOrder(order, channel);
      if (result.success) {
        const updated: Order = {
          ...order,
          status: 'sent',
          sentVia: channel,
          sentAt: new Date().toISOString(),
        };
        await addOrUpdate(updated);
        setOrder(updated);
        setSent(true);
      } else {
        Alert.alert('Send failed', result.error ?? 'Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to send order.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="checkmark-circle" size={56} color="#2E7D32" />
        </View>
        <Text className="text-2xl font-bold text-gray-800 text-center mb-2">Order Sent!</Text>
        <Text className="text-gray-500 text-center mb-8">
          Your order has been sent to {order.storeContact.name || 'the store'} via{' '}
          {channel.charAt(0).toUpperCase() + channel.slice(1)}.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/home')}
          className="bg-primary rounded-2xl px-8 py-4 w-full items-center"
        >
          <Text className="text-white font-semibold text-base">Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/record')}
          className="mt-3 py-3 w-full items-center"
        >
          <Text className="text-primary text-sm">Place another order</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const previewText = formatOrderAsText(order);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Order preview */}
        <View className="bg-white rounded-2xl p-4 mb-5 shadow-sm">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
            Order Preview
          </Text>
          <Text className="text-gray-700 text-sm font-mono leading-6">{previewText}</Text>
        </View>

        {/* Channel picker */}
        <Text className="text-gray-700 font-semibold text-base mb-3">Send via</Text>
        <SendChannelPicker selected={channel} onSelect={setChannel} />

        {/* Store info */}
        <View className="bg-white rounded-2xl p-4 mt-5 shadow-sm">
          <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">
            Sending to
          </Text>
          <Text className="text-gray-800 font-medium">{order.storeContact.name || 'Store'}</Text>
          <Text className="text-gray-500 text-sm">{order.storeContact.phone}</Text>
          {order.storeContact.email && (
            <Text className="text-gray-500 text-sm">{order.storeContact.email}</Text>
          )}
        </View>
      </ScrollView>

      {/* Send button */}
      <View className="px-5 pb-6 pt-3 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending}
          className={`rounded-2xl py-4 items-center ${sending ? 'bg-gray-200' : 'bg-primary'}`}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Send Order via {channel.charAt(0).toUpperCase() + channel.slice(1)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
