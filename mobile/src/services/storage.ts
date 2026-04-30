import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { Order } from '../models/order';
import type { AppSettings } from '../models/settings';
import { DEFAULT_SETTINGS } from '../models/settings';

const KEYS = {
  ORDERS: 'kirana_orders',
  SETTINGS: 'kirana_settings',
  ONBOARDED: 'kirana_onboarded',
  CLAUDE_API_KEY: 'kirana_claude_key',
};

// Orders
export async function getOrders(): Promise<Order[]> {
  const raw = await AsyncStorage.getItem(KEYS.ORDERS);
  if (!raw) return [];
  return JSON.parse(raw) as Order[];
}

export async function saveOrder(order: Order): Promise<void> {
  const orders = await getOrders();
  const idx = orders.findIndex((o) => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = order;
  } else {
    orders.unshift(order);
  }
  await AsyncStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
}

export async function deleteOrder(id: string): Promise<void> {
  const orders = await getOrders();
  await AsyncStorage.setItem(
    KEYS.ORDERS,
    JSON.stringify(orders.filter((o) => o.id !== id))
  );
}

// Settings
export async function getSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
  if (!raw) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AppSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// Onboarding flag
export async function hasOnboarded(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDED);
  return val === 'true';
}

export async function markOnboarded(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDED, 'true');
}

// Claude API key (encrypted)
export async function getClaudeApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.CLAUDE_API_KEY);
}

export async function saveClaudeApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.CLAUDE_API_KEY, key);
}

export async function deleteClaudeApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.CLAUDE_API_KEY);
}
