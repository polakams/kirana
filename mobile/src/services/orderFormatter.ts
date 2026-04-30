import type { Order, OrderItem } from '../models/order';

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatItem(item: OrderItem, index: number): string {
  const qty = item.quantity % 1 === 0 ? item.quantity.toString() : item.quantity.toFixed(1);
  const unit = item.unit === 'piece' ? '' : ` ${item.unit}`;
  return `${index + 1}. ${capitalize(item.name)}  -  ${qty}${unit}`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatOrderAsText(order: Order): string {
  const lines = [
    `*New Grocery Order* 🛒`,
    `Date: ${formatDate(order.createdAt)}`,
    `Store: ${order.storeContact.name}`,
    `─────────────────────`,
    ...order.items.map(formatItem),
    `─────────────────────`,
    `Total items: ${order.items.length}`,
    ``,
    `Sent via Kirana App`,
  ];
  return lines.join('\n');
}

export function formatOrderAsHTML(order: Order): string {
  const itemRows = order.items
    .map((item, i) => {
      const qty = item.quantity % 1 === 0 ? item.quantity.toString() : item.quantity.toFixed(1);
      const unit = item.unit === 'piece' ? '' : ` ${item.unit}`;
      return `<tr><td>${i + 1}</td><td>${capitalize(item.name)}</td><td>${qty}${unit}</td></tr>`;
    })
    .join('\n');

  return `
<html><body style="font-family: sans-serif; padding: 16px;">
  <h2>New Grocery Order</h2>
  <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
  <p><strong>Store:</strong> ${order.storeContact.name}</p>
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
    <thead><tr><th>#</th><th>Item</th><th>Quantity</th></tr></thead>
    <tbody>${itemRows}</tbody>
  </table>
  <p><em>Total items: ${order.items.length}</em></p>
  <br><small>Sent via Kirana App</small>
</body></html>`;
}
