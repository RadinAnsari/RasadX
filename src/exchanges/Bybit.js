import axios from "axios";
import { retry } from "../utils/retry.js";
import { logger } from "../utils/logger.js";

const BYBIT_API_URL = "https://api.bybit.com";

export class Bybit {

   constructor() {
    this.name = "Bybit";
  }

  async getExchangeInfo() {
    return retry(
      async () => {
        try {
          const response = await axios.get(
            `${BYBIT_API_URL}/v5/market/instruments-info`,
            {
              params: {
                category: "spot",
              },
            }
          );

          logger.info("Bybit exchange info fetched");

          return response.data;
        } catch (error) {
          logger.warn("Bybit request failed", {
            status: error.response?.status,
            message: error.message,
          });

          throw error;
        }
      },
      {
        retries: 3,
        delay: 2000,

        shouldRetry: (error) => {
          const status = error.response?.status;

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
    const data = await this.getExchangeInfo();

    return data.result.list
      .filter((item) => item.status === "Trading")
      .map((item) => ({
        symbol: item.symbol,
        status: item.status,
        baseAsset: item.baseCoin,
        quoteAsset: item.quoteCoin,
      }));
  }
}