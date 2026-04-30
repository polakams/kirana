import { useState, useEffect, useCallback } from 'react';
import type { Order } from '../models/order';
import { getOrders, saveOrder, deleteOrder } from '../services/storage';

export function useOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const all = await getOrders();
    setOrders(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addOrUpdate = useCallback(async (order: Order) => {
    await saveOrder(order);
    await reload();
  }, [reload]);

  const remove = useCallback(async (id: string) => {
    await deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  return { orders, loading, reload, addOrUpdate, remove };
}
