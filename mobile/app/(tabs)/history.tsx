import React, { useCallback } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOrderHistory } from '../../src/hooks/useOrderHistory';
import { OrderSummaryCard } from '../../src/components/OrderSummaryCard';
import { EmptyState } from '../../src/components/EmptyState';

export default function HistoryScreen() {
  const { orders, loading, reload, remove } = useOrderHistory();

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const handleDelete = (id: string) => {
    Alert.alert('Delete Order', 'Remove this order from history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-xl font-bold text-gray-800">Order History</Text>
        <Text className="text-gray-500 text-sm">{orders.length} order{orders.length !== 1 ? 's' : ''}</Text>
      </View>

      {!loading && orders.length === 0 ? (
        <EmptyState
          icon="time-outline"
          title="No order history"
          subtitle="Your past orders will appear here"
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingTop: 8 }}
          renderItem={({ item }) => (
            <OrderSummaryCard
              order={item}
              onPress={() =>
                router.push({ pathname: '/review', params: { orderId: item.id } })
              }
              onResend={() =>
                router.push({ pathname: '/send', params: { orderId: item.id } })
              }
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
