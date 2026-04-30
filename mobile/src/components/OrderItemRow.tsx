import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { OrderItem } from '../models/order';

interface OrderItemRowProps {
  item: OrderItem;
  index: number;
  onUpdate: (updated: OrderItem) => void;
  onDelete: (id: string) => void;
}

export function OrderItemRow({ item, index, onUpdate, onDelete }: OrderItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(String(item.quantity));
  const [unit, setUnit] = useState(item.unit);

  const handleSave = () => {
    const qty = parseFloat(quantity);
    if (!name.trim() || isNaN(qty) || qty <= 0) return;
    onUpdate({ ...item, name: name.trim(), quantity: qty, unit: unit.trim() || 'piece' });
    setEditing(false);
  };

  const qtyDisplay = item.quantity % 1 === 0 ? String(item.quantity) : item.quantity.toFixed(1);
  const unitDisplay = item.unit === 'piece' ? 'pcs' : item.unit;

  if (editing) {
    return (
      <View className="flex-row items-center bg-yellow-50 border border-yellow-300 rounded-lg px-3 py-2 mb-1">
        <Text className="text-gray-400 w-7 text-sm font-mono">{index}.</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          className="flex-1 text-gray-800 text-base"
          autoFocus
        />
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
          className="w-12 text-center text-gray-800 font-mono border-l border-gray-200 ml-2 pl-2"
        />
        <TextInput
          value={unit}
          onChangeText={setUnit}
          className="w-14 text-center text-gray-500 text-sm border-l border-gray-200 ml-1 pl-2"
        />
        <TouchableOpacity onPress={handleSave} className="ml-2">
          <Ionicons name="checkmark-circle" size={22} color="#2E7D32" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row items-center bg-white border-b border-gray-100 px-3 py-3">
      {/* Row number */}
      <Text className="text-gray-400 w-7 text-sm font-mono">{index}.</Text>

      {/* Item name */}
      <Text className="flex-1 text-gray-800 text-base capitalize">{item.name}</Text>

      {/* Quantity + unit */}
      <Text className="text-gray-700 font-mono text-base w-20 text-right">
        {qtyDisplay} {unitDisplay}
      </Text>

      {/* Actions */}
      <TouchableOpacity onPress={() => setEditing(true)} className="pl-3 py-1">
        <Ionicons name="pencil" size={16} color="#aaa" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(item.id)} className="pl-2 py-1">
        <Ionicons name="close" size={18} color="#C62828" />
      </TouchableOpacity>
    </View>
  );
}
