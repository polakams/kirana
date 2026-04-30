import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useOrderHistory } from '../../src/hooks/useOrderHistory';
import { OrderSummaryCard } from '../../src/components/OrderSummaryCard';
import { EmptyState } from '../../src/components/EmptyState';

export default function HomeScreen() {
  const { orders, loading, reload } = useOrderHistory();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const recentOrders = orders.slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-800">Kirana</Text>
          <Text className="text-gray-500 text-sm">Your voice grocery assistant</Text>
        </View>

        {/* Record button */}
        <TouchableOpacity
          onPress={() => router.push('/record')}
          activeOpacity={0.85}
          className="mx-5 mt-4 bg-primary rounded-2xl p-5 flex-row items-center gap-4 shadow"
        >
          <View className="w-14 h-14 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="mic" size={28} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">Start New Order</Text>
            <Text className="text-white/80 text-sm">Speak your grocery list</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="white" />
        </TouchableOpacity>

        {/* Recent orders */}
        <View className="px-5 mt-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-800 font-semibold text-base">Recent Orders</Text>
            {orders.length > 3 && (
              <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
                <Text className="text-primary text-sm">See all</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? null : recentOrders.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No orders yet"
              subtitle="Tap 'Start New Order' to place your first order"
            />
          ) : (
            recentOrders.map((order) => (
              <OrderSummaryCard
                key={order.id}
                order={order}
                onPress={() =>
                  router.push({ pathname: '/review', params: { orderId: order.id } })
                }
                onResend={() =>
                  router.push({ pathname: '/send', params: { orderId: order.id } })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
