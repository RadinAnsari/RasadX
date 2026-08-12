import axios from "axios";
import { retry } from "../utils/retry.js";
import { logger } from "../utils/logger.js";

const BINANCE_API_URL =
  "https://api.binance.com";

export class Binance {

   constructor() {
    this.name = "Binance";
  }

  async getExchangeInfo() {
    return retry(
      async () => {
        try {
          const response = await axios.get(
            `${BINANCE_API_URL}/api/v3/exchangeInfo`
          );

          logger.info(
            "Binance exchange info fetched"
          );

          return response.data;
        } catch (error) {
          logger.warn(
            "Binance request failed",
            {
              status:
                error.response?.status,
              message: error.message,
            }
          );

          throw error;
        }
      },
      {
        retries: 3,
        delay: 2000,

        shouldRetry: (error) => {
          const status =
            error.response?.status;

          return (
            !status ||
            status === 429 ||
            status >= 500
          );
        },
      }
    );
  }

  async getSymbols() {
    const exchangeInfo =
      await this.getExchangeInfo();

    return exchangeInfo.symbols.map(
      (symbol) => ({
        symbol: symbol.symbol,
        status: symbol.status,
        baseAsset: symbol.baseAsset,
        quoteAsset: symbol.quoteAsset,
      })
    );
  }
}