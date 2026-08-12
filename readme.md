# 🚨 RasadX

> Cryptocurrency Listing Monitoring & Alert System

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ESM-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Tests](https://img.shields.io/badge/tests-Vitest-purple)](https://vitest.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**RasadX** is a modular Node.js monitoring and notification system that detects newly listed trading pairs across cryptocurrency exchanges and sends real-time alerts through Telegram and Email.

The project is built with a focus on clean architecture, separation of concerns, dependency injection, testability, and extensibility.

---

## 🔗 Quick Links

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🔄 How It Works](#-how-it-works)
- [🧩 Project Structure](#-project-structure)
- [🛠️ Tech Stack](#️-tech-stack)
- [🧪 Testing](#-testing)
- [🚀 Getting Started](#-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [➕ Adding an Exchange](#-adding-a-new-exchange)
- [➕ Adding a Notification Channel](#-adding-a-new-notification-channel)
- [🧠 Design Principles](#-design-principles)
- [📈 Future Improvements](#-future-improvements)
- [⚠️ Disclaimer](#️-disclaimer)

---

## ✨ Features

- 🔎 Monitor cryptocurrency listings
- 🏦 Binance integration
- 🏦 Bybit integration
- 📱 Telegram notifications
- 📧 Email notifications
- 💾 JSON-based persistent state
- 🔄 Automatic retry for temporary API failures
- 🧪 Unit testing with Vitest
- 🧩 Modular and extensible architecture
- 📝 Structured logging
- ⏱️ Periodic monitoring
- 🛡️ Duplicate listing prevention
- 🔐 Environment-based configuration

---

## 🏗️ Architecture

rasadX follows a modular architecture based on separation of responsibilities.

```text
                    ┌──────────────────┐
                    │     index.js     │
                    │   Application    │
                    │      Entry       │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
        ┌───────────────┐         ┌───────────────┐
        │    Binance    │         │     Bybit     │
        │    Adapter    │         │    Adapter    │
        └───────┬───────┘         └───────┬───────┘
                │                         │
                └────────────┬────────────┘
                             ▼
                    ┌─────────────────┐
                    │ ListingMonitor  │
                    │  Core Business  │
                    │      Logic      │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
           ┌────────────────┐ ┌────────────────┐
           │ JsonRepository │ │ Notifications  │
           │   Persistence  │ │    Layer       │
           └────────────────┘ └───────┬────────┘
                                      │
                              ┌───────┴───────┐
                              ▼               ▼
                         ┌─────────┐     ┌─────────┐
                         │Telegram │     │  Email  │
                         └─────────┘     └─────────┘
```

---

## 🔄 How It Works

### 1. Fetch exchange data

Exchange adapters retrieve the latest market information.

```text
Binance API
     ↓
Binance Adapter
```

```text
Bybit API
     ↓
Bybit Adapter
```

### 2. Normalize exchange data

Different exchanges return different response formats.

Each adapter converts exchange-specific responses into a common internal structure:

```js
{
  symbol: "BTCUSDT",
  status: "TRADING",
  baseAsset: "BTC",
  quoteAsset: "USDT"
}
```

This keeps the monitoring layer independent from exchange-specific API formats.

### 3. Compare current state with previous state

Previously detected symbols are stored in:

```text
data/symbols.json
```

Example:

```json
{
  "Binance": [
    "BTCUSDT",
    "ETHUSDT"
  ],
  "Bybit": [
    "BTCUSDT",
    "SOLUSDT"
  ]
}
```

If the exchange returns:

```text
Previous:
BTCUSDT
ETHUSDT

Current:
BTCUSDT
ETHUSDT
ABCUSDT
```

rasadX detects:

```text
🚨 ABCUSDT
```

as a new listing.

### 4. Send notifications

Every newly detected listing is passed to the configured notification services.

```text
New Listing
     │
     ├──────────► Telegram
     │
     └──────────► Email
```

Example:

```text
🚨 NEW LISTING

Exchange: Binance
Symbol: ABCUSDT
Time: 2026-08-12T12:00:00.000Z
```

---

## 🧩 Project Structure

```text
rasadX/
│
├── src/
│   │
│   ├── exchanges/
│   │   ├── Binance.js
│   │   └── Bybit.js
│   │
│   ├── repositories/
│   │   └── JsonRepository.js
│   │
│   ├── services/
│   │   ├── ListingMonitor.js
│   │   ├── NotificationService.js
│   │   └── EmailNotificationService.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   └── retry.js
│   │
│   └── index.js
│
├── tests/
│   ├── Binance.test.js
│   ├── Bybit.test.js
│   ├── EmailNotificationService.test.js
│   ├── JsonRepository.test.js
│   ├── ListingMonitor.test.js
│   ├── NotificationService.test.js
│   └── retry.test.js
│
├── data/
│   └── symbols.json
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

### Runtime

- Node.js
- JavaScript
- ES Modules

### HTTP / APIs

- Axios
- Binance REST API
- Bybit REST API

### Notifications

- Telegram Bot API
- Nodemailer
- SMTP

### Persistence

- JSON file storage

### Testing

- Vitest
- Mocking external dependencies

### Utilities

- dotenv
- Structured logging
- Reusable retry mechanism

---

## 🔄 Retry Mechanism

External APIs can temporarily fail because of:

- Network problems
- Server errors
- Rate limits
- Temporary service unavailability

rasadX includes a reusable retry utility.

Example:

```js
await retry(fetchData, {
  retries: 3,
  delay: 2000,
  shouldRetry: (error) => {
    const status = error.response?.status;

    return (
      !status ||
      status === 429 ||
      status >= 500
    );
  }
});
```

The system retries temporary failures while avoiding unnecessary retries for client-side errors.

```text
Request
   │
   ├── ❌ 500
   │
   ├── Retry
   │
   ├── ❌ 500
   │
   ├── Retry
   │
   └── ✅ Success
```

---

## 🧪 Testing

rasadX uses **Vitest** for unit testing.

Tests cover:

- Listing detection
- Duplicate listing prevention
- First-run initialization
- Exchange state isolation
- Multiple notification services
- JSON persistence
- Binance API adapter
- Bybit API adapter
- Telegram notification service
- Email notification service
- Retry behavior

External services are mocked during unit tests.

Therefore, the test suite does not require:

- Real Binance API calls
- Real Bybit API calls
- Real Telegram messages
- A real SMTP server

Run the test suite:

```bash
npm test
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js 20+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/RadinAnsari/rasadX.git
cd rasadX
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```bash
cp .env.example .env
```

Example:

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

SMTP_HOST=
SMTP_PORT=465
SMTP_USER=
SMTP_PASSWORD=

EMAIL_FROM=
EMAIL_TO=
```

Never commit `.env` to Git.

### 4. Initialize JSON storage

Create:

```text
data/symbols.json
```

with:

```json
{}
```

The application will populate the exchange state automatically.

### 5. Start the monitor

```bash
npm run dev
```

The application periodically checks the configured exchanges and sends notifications when new listings are detected.

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `TELEGRAM_CHAT_ID` | Telegram destination chat |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP server port |
| `SMTP_USER` | SMTP username |
| `SMTP_PASSWORD` | SMTP credential / app password |
| `EMAIL_FROM` | Sender email |
| `EMAIL_TO` | Destination email |

Sensitive credentials are intentionally stored in environment variables and excluded from version control.

---

## ➕ Adding a New Exchange

The exchange layer is designed around a simple adapter concept.

For example:

```text
src/exchanges/OKX.js
```

```js
export class OKX {
  constructor() {
    this.name = "OKX";
  }

  async getSymbols() {
    // Fetch and normalize OKX symbols
  }
}
```

The core `ListingMonitor` does not need to know the details of the OKX API.

This makes the system easy to extend to additional exchanges.

---

## ➕ Adding a New Notification Channel

Notification services follow the same conceptual interface.

For example:

```text
src/services/DiscordNotificationService.js
```

```js
export class DiscordNotificationService {
  async sendNewListing({
    exchange,
    symbol,
  }) {
    // Send Discord notification
  }
}
```

It can then be added to the notification services array:

```js
const notificationServices = [
  telegramNotification,
  emailNotification,
  discordNotification,
];
```

The core listing detection logic does not need to change.

---

## 🧠 Design Principles

### Separation of Concerns

Exchange communication, business logic, persistence, and notifications are separated.

```text
Exchange
   ↓
ListingMonitor
   ↓
Repository / Notifications
```

### Dependency Injection

Core services receive their dependencies instead of creating them internally.

```js
new ListingMonitor(
  exchange,
  repository,
  notificationServices
);
```

This makes the business logic easier to test and extend.

### Adapter Pattern

Each exchange adapter hides exchange-specific API details.

```text
Binance API ──► Binance Adapter ──┐
                                  ├──► Common Format
Bybit API ────► Bybit Adapter ────┘
```

### Extensible Notification Layer

Notification providers expose the same conceptual operation:

```js
sendNewListing({
  exchange,
  symbol
});
```

This allows additional channels to be introduced without changing the core listing detection logic.

### Testability

External dependencies are injected and mocked during unit tests.

This allows the core business logic to be tested without network access or real credentials.


## ⚠️ Disclaimer

This project is an educational and software engineering project.

It monitors publicly available exchange market information and sends notifications.

It does **not** execute trades or provide financial advice.

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with Node.js and JavaScript.
</p>
