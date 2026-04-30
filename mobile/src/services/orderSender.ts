import * as SMS from 'expo-sms';
import * as MailComposer from 'expo-mail-composer';
import * as Clipboard from 'expo-clipboard';
import type { Order, SendChannel } from '../models/order';
import { formatOrderAsText, formatOrderAsHTML } from './orderFormatter';

interface SendResult {
  success: boolean;
  channel: SendChannel;
  error?: string;
}

export async function sendViaWhatsApp(order: Order): Promise<SendResult> {
  const apiBase = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.0.227:8081';
  const message = formatOrderAsText(order);
  const phone = order.storeContact.phone.replace(/[^0-9+]/g, '');

  try {
    const response = await fetch(`${apiBase}/api/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: phone, message }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { success: false, channel: 'whatsapp', error: `Send failed (${response.status}): ${text}` };
    }

    return { success: true, channel: 'whatsapp' };
  } catch (err) {
    return {
      success: false,
      channel: 'whatsapp',
      error: err instanceof Error ? err.message : 'Failed to send WhatsApp message',
    };
  }
}

export async function sendViaSMS(order: Order): Promise<SendResult> {
  const isAvailable = await SMS.isAvailableAsync();
  if (!isAvailable) {
    return { success: false, channel: 'sms', error: 'SMS is not available on this device' };
  }
  const phone = order.storeContact.phone.replace(/[^0-9+]/g, '');
  const message = formatOrderAsText(order);
  const { result } = await SMS.sendSMSAsync([phone], message);
  return {
    success: result === 'sent' || result === 'unknown',
    channel: 'sms',
    error: result === 'cancelled' ? 'SMS cancelled' : undefined,
  };
}

export async function sendViaEmail(order: Order): Promise<SendResult> {
  const isAvailable = await MailComposer.isAvailableAsync();
  if (!isAvailable) {
    return { success: false, channel: 'email', error: 'Email is not configured on this device' };
  }
  if (!order.storeContact.email) {
    return { success: false, channel: 'email', error: 'No email address set for this store' };
  }
  const result = await MailComposer.composeAsync({
    recipients: [order.storeContact.email],
    subject: `Grocery Order – ${new Date(order.createdAt).toLocaleDateString('en-IN')}`,
    body: formatOrderAsHTML(order),
    isHtml: true,
  });
  return {
    success: result.status === 'sent',
    channel: 'email',
    error: result.status === 'cancelled' ? 'Email cancelled' : undefined,
  };
}

export async function copyToClipboard(order: Order): Promise<SendResult> {
  const message = formatOrderAsText(order);
  await Clipboard.setStringAsync(message);
  return { success: true, channel: 'copy' };
}

export async function sendOrder(order: Order, channel: SendChannel): Promise<SendResult> {
  switch (channel) {
    case 'whatsapp': return sendViaWhatsApp(order);
    case 'sms': return sendViaSMS(order);
    case 'email': return sendViaEmail(order);
    case 'copy': return copyToClipboard(order);
  }
}
