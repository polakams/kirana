# Kirana — Architecture & Sequence Diagrams

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Android Device                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              React Native (Expo)                 │   │
│  │                                                  │   │
│  │   RecordScreen  →  ReviewScreen  →  SendScreen   │   │
│  │        │                                 │       │   │
│  │   useSpeechRecognition            sendViaWhatsApp│   │
│  │   (expo-speech-recognition)               │      │   │
│  └───────────────────────────────────────────┼──────┘   │
│                  │ POST /api/parse-order      │          │
│                  │ POST /api/send-whatsapp    │          │
└──────────────────┼────────────────────────────┼──────────┘
                   │                            │
         ┌─────────▼──────────┐      ┌──────────▼──────────┐
         │   Expo API Routes  │      │   Expo API Routes   │
         │  (Node.js, server) │      │  (Node.js, server)  │
         │  parse-order+api   │      │  send-whatsapp+api  │
         └─────────┬──────────┘      └──────────┬──────────┘
                   │                            │
         ┌─────────▼──────────┐      ┌──────────▼──────────┐
         │   Anthropic API    │      │  Spring Boot GKE    │
         │   Claude Haiku     │      │  WhatsApp Service   │
         │  (AI order parse)  │      │  api.dapexim.com    │
         └────────────────────┘      └─────────────────────┘
                                               │
                                     ┌─────────▼──────────┐
                                     │  WhatsApp Business  │
                                     │       API           │
                                     └─────────────────────┘
```

---

## Component Architecture

```
mobile/
├── app/                           [Expo Router screens]
│   ├── (tabs)/
│   │   ├── home.tsx               HomeScreen
│   │   │     └── OrderSummaryCard (recent orders list)
│   │   ├── history.tsx            OrderHistoryScreen
│   │   └── settings.tsx           SettingsScreen
│   │         └── Field (reusable input)
│   ├── api/
│   │   ├── parse-order+api.ts     ← Claude API key lives here only
│   │   └── send-whatsapp+api.ts   ← Bearer token lives here only
│   ├── record.tsx                 RecordScreen
│   │     ├── MicrophoneButton
│   │     └── useSpeechRecognition hook
│   ├── review.tsx                 ReviewScreen
│   │     └── OrderItemRow (inline editable)
│   ├── send.tsx                   SendScreen
│   │     └── SendChannelPicker
│   └── onboarding.tsx             OnboardingScreen (first launch)
│
└── src/
    ├── hooks/
    │   ├── useSpeechRecognition   Native speech, segments[]
    │   ├── useOrderParser         Calls /api/parse-order
    │   ├── useOrderHistory        AsyncStorage CRUD
    │   └── useSettings            AsyncStorage settings
    ├── services/
    │   ├── claudeParser           Claude Haiku prompt + Zod validation
    │   ├── orderFormatter         Text / HTML message templates
    │   ├── orderSender            WhatsApp API / SMS / Email / Copy
    │   └── storage                AsyncStorage keys + serialization
    ├── models/
    │   ├── order.ts               Order, OrderItem, StoreContact types
    │   ├── settings.ts            AppSettings, SPEECH_LANGUAGES
    │   └── schemas.ts             Zod schemas for API responses
    └── utils/
        ├── fallbackParser         Regex parser (offline mode)
        └── idGenerator            nanoid-based ID generation
```

---

## Sequence Diagrams

### 1. Voice Order — Happy Path (Claude AI available)

```mermaid
sequenceDiagram
    actor User
    participant App as RecordScreen
    participant SR as SpeechRecognition<br/>(Native)
    participant Review as ReviewScreen
    participant API as Expo API Route<br/>/api/parse-order
    participant Claude as Anthropic<br/>Claude Haiku

    User->>App: Tap mic button
    App->>SR: startListening(language)
    SR-->>App: interim transcript (live preview)

    Note over SR,App: Each natural pause triggers a final event
    SR-->>App: onResult(isFinal=true, "2 kg tomatoes")
    App->>App: segments.push("2 kg tomatoes")
    SR-->>App: onResult(isFinal=true, "1 litre milk")
    App->>App: segments.push("1 litre milk")

    User->>App: Tap Done
    App->>SR: stopListening()
    App->>API: POST /api/parse-order<br/>{ transcript: "2 kg tomatoes, 1 litre milk" }
    API->>Claude: Parse grocery transcript (system prompt)
    Claude-->>API: { items: [{name,qty,unit}], confidence: "high" }
    API-->>App: 200 OK { items }
    App->>Review: navigate(orderId)
    Review-->>User: POS-style numbered list
```

---

### 2. Voice Order — Offline Fallback

```mermaid
sequenceDiagram
    actor User
    participant App as RecordScreen
    participant API as Expo API Route<br/>/api/parse-order
    participant Fallback as fallbackParser<br/>(regex, client-side)
    participant Review as ReviewScreen

    User->>App: Tap Done (no internet)
    App->>API: POST /api/parse-order
    API--xApp: Network error / timeout

    Note over App: Catches error, runs local fallback
    App->>Fallback: parseFallback(transcript)
    Fallback-->>App: OrderItem[] (best-effort)
    App->>Review: navigate(orderId)
    Review-->>User: Items shown (may need editing)
```

---

### 3. Send Order via WhatsApp (Direct API)

```mermaid
sequenceDiagram
    actor User
    participant Send as SendScreen
    participant Sender as orderSender.ts
    participant APIRoute as Expo API Route<br/>/api/send-whatsapp
    participant GKE as Spring Boot GKE<br/>api.dapexim.com
    participant WA as WhatsApp<br/>Business API

    User->>Send: Tap "Send Order via WhatsApp"
    Send->>Sender: sendViaWhatsApp(order)
    Sender->>APIRoute: POST /api/send-whatsapp<br/>{ to, message }

    Note over APIRoute: Bearer token injected server-side
    APIRoute->>GKE: POST /api/send-message<br/>{ from, to, type, textBody, timestamp }<br/>Authorization: Bearer <token>

    GKE->>WA: Send WhatsApp message
    WA-->>GKE: 200 OK
    GKE-->>APIRoute: { success: true }
    APIRoute-->>Sender: 200 OK
    Sender-->>Send: { success: true, channel: 'whatsapp' }
    Send->>Send: Update order status → 'sent'
    Send-->>User: "Order Sent!" confirmation screen
```

---

### 4. Add More Items to Existing Order

```mermaid
sequenceDiagram
    actor User
    participant Review as ReviewScreen
    participant Record as RecordScreen
    participant Storage as AsyncStorage

    User->>Review: Tap "Add More"
    Review->>Record: navigate('/record?appendOrderId=<id>')

    User->>Record: Speak additional items
    Record->>Record: Parse new items (Claude or fallback)
    Record->>Storage: Load existing order by appendOrderId
    Record->>Storage: Save merged order (existing + new items)
    Record->>Review: navigate('/review?orderId=<id>')
    Review-->>User: Updated list with all items
```

---

### 5. First Launch Onboarding

```mermaid
sequenceDiagram
    actor User
    participant Root as _layout.tsx
    participant Storage as AsyncStorage
    participant Onboard as OnboardingScreen
    participant Home as HomeScreen

    Root->>Storage: checkOnboarded()
    Storage-->>Root: false (first launch)
    Root->>Onboard: redirect('/onboarding')

    User->>Onboard: Step 1 — Welcome screen → Continue
    User->>Onboard: Step 2 — Enter store name + phone → Get Started
    Onboard->>Storage: saveSettings(storeContact)
    Onboard->>Storage: markOnboarded()
    Onboard->>Home: router.replace('/(tabs)/home')
    Home-->>User: Home screen (ready to order)
```

---

## Data Flow

```
User Speech
    │
    ▼
expo-speech-recognition (native OS)
    │  isFinal events per pause
    ▼
segments: string[]          ← one item per pause
    │
    ▼
POST /api/parse-order       ← Expo API Route (server)
    │
    ├─ Claude Haiku ──────► { items, confidence }
    │                                │
    └─ fallbackParser (offline) ─────┘
                                     │
                                     ▼
                               OrderItem[]
                                     │
                           AsyncStorage (draft order)
                                     │
                                     ▼
                            ReviewScreen (edit)
                                     │
                                     ▼
                         POST /api/send-whatsapp
                                     │
                         Spring Boot GKE → WhatsApp
                                     │
                           order.status = 'sent'
                                     │
                           AsyncStorage (history)
```

---

## Security Model

| Secret | Location | Accessible by |
|--------|----------|--------------|
| `CLAUDE_API_KEY` | `.env.local` (server) | Expo API Route only |
| `WHATSAPP_BEARER_TOKEN` | `.env.local` (server) | Expo API Route only |
| `WHATSAPP_FROM_NUMBER` | `.env.local` (server) | Expo API Route only |
| `EXPO_PUBLIC_API_URL` | `.env.local` (client-safe) | App bundle |
| Store phone/name | AsyncStorage | App only, on-device |

API keys never leave the server-side Expo API Routes and are never bundled into the client app.

---

## Environment Variables

| Variable | Side | Purpose |
|----------|------|---------|
| `CLAUDE_API_KEY` | Server | Anthropic API authentication |
| `WHATSAPP_API_URL` | Server | GKE WhatsApp service endpoint |
| `WHATSAPP_BEARER_TOKEN` | Server | GKE service authentication |
| `WHATSAPP_FROM_NUMBER` | Server | Sender WhatsApp number |
| `EXPO_PUBLIC_API_URL` | Client | Dev server LAN IP for API calls |
