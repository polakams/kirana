import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { OrderItemRow } from '../src/components/OrderItemRow';
import { EmptyState } from '../src/components/EmptyState';
import { useOrderHistory } from '../src/hooks/useOrderHistory';
import { generateId } from '../src/utils/idGenerator';
import type { Order, OrderItem } from '../src/models/order';

export default function ReviewScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { orders, addOrUpdate } = useOrderHistory();
  const insets = useSafeAreaInsets();
  const bottomBarHeight = 72 + insets.bottom;
  const [order, setOrder] = useState<Order | null>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newUnit, setNewUnit] = useState('piece');

  useEffect(() => {
    const found = orders.find((o) => o.id === orderId);
    if (found) setOrder(found);
  }, [orders, orderId]);

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color="#2E7D32" />
      </View>
    );
  }

  const updateItem = (updated: OrderItem) => {
    const newOrder = { ...order, items: order.items.map((i) => i.id === updated.id ? updated : i) };
    setOrder(newOrder);
    addOrUpdate(newOrder);
  };

  const deleteItem = (id: string) => {
    const newOrder = { ...order, items: order.items.filter((i) => i.id !== id) };
    setOrder(newOrder);
    addOrUpdate(newOrder);
  };

  const addItem = () => {
    if (!newName.trim()) return;
    const qty = parseFloat(newQty);
    const item: OrderItem = {
      id: generateId(),
      name: newName.trim().toLowerCase(),
      quantity: isNaN(qty) || qty <= 0 ? 1 : qty,
      unit: newUnit.trim() || 'piece',
    };
    const newOrder = { ...order, items: [...order.items, item] };
    setOrder(newOrder);
    addOrUpdate(newOrder);
    setNewName('');
    setNewQty('1');
    setNewUnit('piece');
    setAddingItem(false);
  };

  const handleSend = () => {
    if (order.items.length === 0) {
      Alert.alert('Empty order', 'Add at least one item before sending.');
      return;
    }
    router.push({ pathname: '/send', params: { orderId: order.id } });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <FlatList
        data={order.items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomBarHeight + 16 }}
        ListHeaderComponent={
          <View>
            {order.transcript ? (
              <View className="bg-white rounded-xl p-3 border border-gray-100 mb-3">
                <Text className="text-gray-400 text-xs font-medium mb-1">YOU SAID</Text>
                <Text className="text-gray-600 text-sm italic" numberOfLines={3}>
                  "{order.transcript}"
                </Text>
              </View>
            ) : null}
            {/* POS-style table header */}
            <View className="flex-row bg-gray-800 px-3 py-2 rounded-t-lg">
              <Text className="text-gray-400 w-7 text-xs font-mono">#</Text>
              <Text className="flex-1 text-gray-300 text-xs font-semibold uppercase">Item</Text>
              <Text className="text-gray-300 text-xs font-semibold uppercase w-20 text-right">Qty</Text>
              <View className="w-10" />
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <OrderItemRow item={item} index={index + 1} onUpdate={updateItem} onDelete={deleteItem} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="basket-outline"
            title="No items"
            subtitle="Add items manually below"
          />
        }
        ListFooterComponent={
          <>
            {/* POS total row */}
            {order.items.length > 0 && (
              <View className="flex-row bg-gray-100 px-3 py-2 border-b border-gray-200">
                <Text className="flex-1 text-gray-700 font-semibold text-sm">Total Items</Text>
                <Text className="text-gray-700 font-bold font-mono text-sm">{order.items.length}</Text>
                <View className="w-10" />
              </View>
            )}
            {addingItem ? (
            <View className="bg-white rounded-xl px-3 py-3 mt-2 border border-primary">
              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Item name (e.g. tomatoes)"
                className="text-gray-800 text-base border-b border-gray-100 pb-2 mb-2"
                autoFocus
              />
              <View className="flex-row gap-2">
                <TextInput
                  value={newQty}
                  onChangeText={setNewQty}
                  keyboardType="decimal-pad"
                  placeholder="Qty"
                  className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-800 text-center"
                />
                <TextInput
                  value={newUnit}
                  onChangeText={setNewUnit}
                  placeholder="unit"
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-800"
                />
                <TouchableOpacity onPress={addItem} className="bg-primary rounded-lg px-3 items-center justify-center">
                  <Ionicons name="add" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setAddingItem(true)}
              className="flex-row items-center gap-2 py-3 mt-1"
            >
              <Ionicons name="add-circle-outline" size={20} color="#2E7D32" />
              <Text className="text-primary text-sm font-medium">Add item manually</Text>
            </TouchableOpacity>
          )}
          </>
        }
      />

      {/* Bottom bar */}
      <View
        style={{ paddingBottom: insets.bottom + 8 }}
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4"
      >
        <View className="flex-row gap-3 mb-2">
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/record', params: { appendOrderId: order.id } })}
            className="flex-1 border-2 border-primary rounded-xl py-3 flex-row items-center justify-center gap-2"
          >
            <Ionicons name="mic" size={18} color="#2E7D32" />
            <Text className="text-primary font-semibold text-sm">Add More</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSend}
            className="flex-1 bg-primary rounded-xl py-3 items-center justify-center"
          >
            <Text className="text-white font-semibold text-sm">Send Order →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
