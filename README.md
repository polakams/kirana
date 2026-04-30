# Kirana — Voice Grocery Ordering App

> Speak your grocery list in any Indian language. Kirana turns it into a structured order and sends it directly to your local store via WhatsApp — no typing, no catalog, no backend required.

---

## Overview

Indian kirana store customers traditionally call or visit to place orders verbally — in Hindi, Telugu, Hinglish, or English. **Kirana** digitises this workflow:

1. Customer opens the app and taps the mic
2. Speaks naturally: *"do kg tamatar, ek litre doodh, teen packet bread"*
3. Claude AI parses the speech into a structured list
4. The app sends a formatted order message directly to the store's WhatsApp

No catalog. No account. No store-side app needed.

---

## Features

- **Voice input** in English, Hindi, Telugu, Kannada, Tamil, Marathi, and Hinglish
- **AI-powered parsing** via Claude Haiku — understands spoken numbers (ek, do, teen), unit normalization (kilo→kg, darjan→dozen), and item name translation (doodh→milk)
- **Segment detection** — each natural pause creates a new list item automatically
- **Direct WhatsApp delivery** — sends via Spring Boot GKE service, no app switching
- **Offline fallback** — regex-based parser works without internet
- **Order history** — browse, resend, or extend past orders
- **Add More** — extend an existing order with additional voice input
- **Multi-channel send** — WhatsApp (direct API), SMS, Email, or clipboard copy

---

## Screenshots

| Record | Review | Send |
|--------|--------|------|
| Mic button + live numbered list | POS-style editable order | Channel picker + one-tap send |

---

## Tech Stack

| Concern | Library |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Navigation | Expo Router (file-based) |
| Speech | expo-speech-recognition |
| AI Parsing | Anthropic Claude Haiku (`@anthropic-ai/sdk`) |
| Styling | NativeWind v4 + Tailwind CSS v3 |
| Storage | AsyncStorage (orders/settings) |
| WhatsApp | Spring Boot GKE service (direct API) |
| Validation | Zod |
| Offline | Custom regex fallback parser |

---

## Project Structure

```
kirana/
├── mobile/                          # React Native Expo app
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── home.tsx             # Home screen with recent orders
│   │   │   ├── history.tsx          # Full order history
│   │   │   └── settings.tsx         # Store contact + language settings
│   │   ├── api/
│   │   │   ├── parse-order+api.ts   # Server route: Claude AI parsing
│   │   │   └── send-whatsapp+api.ts # Server route: GKE WhatsApp proxy
│   │   ├── record.tsx               # Voice recording screen
│   │   ├── review.tsx               # Order review + edit screen
│   │   ├── send.tsx                 # Send channel screen
│   │   └── onboarding.tsx           # First-launch setup
│   └── src/
│       ├── components/              # UI components
│       ├── hooks/                   # useSpeechRecognition, useOrderHistory, etc.
│       ├── models/                  # TypeScript interfaces (Order, Settings)
│       ├── services/                # claudeParser, orderSender, orderFormatter
│       └── utils/                   # fallbackParser, idGenerator
└── src/main/java/                   # Original Java/Gradle scaffold
```

---

## Setup

### Prerequisites

- Node.js 18+
- Android Studio + Android SDK (for Android build)
- Java 21 (Temurin recommended)
- Expo CLI: `npm install -g expo`

### Install

```bash
cd kirana/mobile
npm install
```

### Environment

Create `mobile/.env.local`:

```env
# Claude AI — server-side only, never sent to client
CLAUDE_API_KEY=sk-ant-...

# WhatsApp GKE service
WHATSAPP_API_URL=https://your-gke-service/api/send-message
WHATSAPP_BEARER_TOKEN=your-bearer-token
WHATSAPP_FROM_NUMBER=15856875843

# LAN IP so Android device can reach your Mac dev server
EXPO_PUBLIC_API_URL=http://<your-mac-lan-ip>:8081
```

### Run (Android device)

```bash
cd kirana/mobile
npx expo run:android
```

> **Note:** `expo-speech-recognition` is a native module — it requires a development build (`expo run:android`), not Expo Go.

---

## WhatsApp Integration

Orders are sent via a Spring Boot service deployed on GKE, not via WhatsApp Web deeplinks.

**Endpoint:** `POST /api/send-message`  
**Auth:** Bearer token  
**Payload:**
```json
{
  "from": "15856875843",
  "to": "919876543210",
  "type": "outgoing",
  "textBody": "*New Order* - 29 Apr 2026\n...",
  "timestamp": "2026-04-29T10:30:00Z"
}
```

The Expo API route (`app/api/send-whatsapp+api.ts`) acts as a server-side proxy, keeping the Bearer token out of the client bundle.

---

## Order Message Format

```
*New Order* - 29 Apr 2026
--------------------------
1. Tomatoes        -  1 kg
2. Milk            -  2 litre
3. Bread           -  3 packets
--------------------------
Total items: 3
Sent via Kirana App
```

---

## Supported Languages

| Code | Language |
|------|----------|
| en-IN | English (India) |
| hi-IN | Hindi |
| te-IN | Telugu |
| kn-IN | Kannada |
| ta-IN | Tamil |
| mr-IN | Marathi |

---

## License

MIT
