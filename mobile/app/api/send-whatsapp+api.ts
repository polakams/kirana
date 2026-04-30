interface SendRequest {
  to: string;
  message: string;
}

interface WhatsAppPayload {
  from: string;
  to: string;
  type: 'outgoing';
  textBody: string;
  timestamp: string;
}

export async function POST(request: Request): Promise<Response> {
  const bearerToken = process.env.WHATSAPP_BEARER_TOKEN;
  const apiUrl = process.env.WHATSAPP_API_URL;
  const fromNumber = process.env.WHATSAPP_FROM_NUMBER;

  if (!bearerToken || !apiUrl || !fromNumber) {
    return Response.json(
      { error: 'WhatsApp service not configured on server' },
      { status: 503 }
    );
  }

  const body = await request.json() as SendRequest;
  const { to, message } = body;

  if (!to || !message) {
    return Response.json({ error: 'to and message are required' }, { status: 400 });
  }

  // Normalize phone: strip non-digits except leading +
  const normalizedTo = to.replace(/[^\d]/g, '');

  const payload: WhatsAppPayload = {
    from: fromNumber,
    to: normalizedTo,
    type: 'outgoing',
    textBody: message,
    timestamp: new Date().toISOString(),
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    return Response.json(
      { error: `WhatsApp service error: ${response.status}`, detail: text },
      { status: response.status }
    );
  }

  const result = await response.json();
  return Response.json({ success: true, result });
}
