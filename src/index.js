import "dotenv/config";

import path from "path";
import { fileURLToPath } from "url";

import { Binance } from "./exchanges/Binance.js";
import { Bybit } from "./exchanges/Bybit.js";

import { ListingMonitor } from "./services/ListingMonitor.js";

import { JsonRepository } from "./repositories/JsonRepository.js";

import { TelegramNotificationService } from "./services/TelegramNotificationService.js";
import { EmailNotificationService } from "./services/EmailNotificationService.js";

// --------------------------------------------------
// Paths
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(
  __dirname,
  "../data/symbols.json"
);

// --------------------------------------------------
// Exchanges
// --------------------------------------------------

const binance = new Binance();
const bybit = new Bybit();

// --------------------------------------------------
// Repository
// --------------------------------------------------

const repository = new JsonRepository(dataPath);

// --------------------------------------------------
// Notification Services
// --------------------------------------------------

const telegramNotification =
  new TelegramNotificationService(
    process.env.TELEGRAM_BOT_TOKEN,
    process.env.TELEGRAM_CHAT_ID
  );

const emailNotification =
  new EmailNotificationService({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
  });

const notificationServices = [
  telegramNotification,
  emailNotification,
];

// --------------------------------------------------
// Monitors
// --------------------------------------------------

const binanceMonitor = new ListingMonitor(
  binance,
  repository,
  notificationServices
);

const bybitMonitor = new ListingMonitor(
  bybit,
  repository,
  notificationServices
);

// --------------------------------------------------
// Main
// --------------------------------------------------

async function run() {
  console.log("\n==============================");
  console.log("🔍 Checking exchanges...");
  console.log("==============================\n");

  // -------------------------------
  // Binance
  // -------------------------------

  try {
    console.log("Checking Binance...");

    const binanceListings =
      await binanceMonitor.check();

    if (binanceListings.length === 0) {
      console.log(
        "No new Binance listings."
      );
    } else {
      for (const symbol of binanceListings) {
        console.log(
          `🚨 NEW BINANCE LISTING: ${symbol}`
        );
      }
    }
  } catch (error) {
    console.error(
      "❌ Binance monitor error:",
      error.message
    );
  }

  // -------------------------------
  // Bybit
  // -------------------------------

  try {
    console.log("Checking Bybit...");

    const bybitListings =
      await bybitMonitor.check();

    if (bybitListings.length === 0) {
      console.log(
        "No new Bybit listings."
      );
    } else {
      for (const symbol of bybitListings) {
        console.log(
          `🚨 NEW BYBIT LISTING: ${symbol}`
        );
      }
    }
  } catch (error) {
    console.error(
      "❌ Bybit monitor error:",
      error.message
    );
  }

  console.log("\n==============================");
  console.log("✅ Check completed");
  console.log("==============================\n");
}

// --------------------------------------------------
// Start
// --------------------------------------------------

await run();

// Check every 60 seconds
setInterval(run, 60 * 1000);