export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  rawText?: string;
}

export interface StoreContact {
  name: string;
  phone: string;
  email?: string;
}

export type OrderStatus = 'draft' | 'sent' | 'failed';
export type SendChannel = 'whatsapp' | 'sms' | 'email' | 'copy';

export interface Order {
  id: string;
  createdAt: string;
  transcript: string;
  items: OrderItem[];
  status: OrderStatus;
  sentVia?: SendChannel;
  sentAt?: string;
  storeContact: StoreContact;
}
