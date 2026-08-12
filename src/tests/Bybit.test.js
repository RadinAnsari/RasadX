import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import axios from "axios";

import { Bybit } from "../exchanges/Bybit.js";

vi.mock("axios");

describe("Bybit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have the correct exchange name", () => {
    const bybit = new Bybit();

    expect(bybit.name).toBe("Bybit");
  });

  it("should return normalized trading symbols", async () => {
    axios.get.mockResolvedValue({
      data: {
        result: {
          list: [
            {
              symbol: "BTCUSDT",
              status: "Trading",
              baseCoin: "BTC",
              quoteCoin: "USDT",
            },
            {
              symbol: "ETHUSDT",
              status: "Trading",
              baseCoin: "ETH",
              quoteCoin: "USDT",
            },
          ],
        },
      },
    });

    const bybit = new Bybit();

    const result =
      await bybit.getSymbols();

    expect(result).toEqual([
      {
        symbol: "BTCUSDT",
        status: "Trading",
        baseAsset: "BTC",
        quoteAsset: "USDT",
      },
      {
        symbol: "ETHUSDT",
        status: "Trading",
        baseAsset: "ETH",
        quoteAsset: "USDT",
      },
    ]);
  });

  it("should ignore non-trading symbols", async () => {
    axios.get.mockResolvedValue({
      data: {
        result: {
          list: [
            {
              symbol: "BTCUSDT",
              status: "Trading",
              baseCoin: "BTC",
              quoteCoin: "USDT",
            },
            {
              symbol: "OLDUSDT",
              status: "Settled",
              baseCoin: "OLD",
              quoteCoin: "USDT",
            },
          ],
        },
      },
    });

    const bybit = new Bybit();

    const result =
      await bybit.getSymbols();

    expect(result).toEqual([
      {
        symbol: "BTCUSDT",
        status: "Trading",
        baseAsset: "BTC",
        quoteAsset: "USDT",
      },
    ]);
  });

  it("should call Bybit spot instruments endpoint", async () => {
    axios.get.mockResolvedValue({
      data: {
        result: {
          list: [],
        },
      },
    });

    const bybit = new Bybit();

    await bybit.getExchangeInfo();

    expect(axios.get).toHaveBeenCalledWith(
      "https://api.bybit.com/v5/market/instruments-info",
      {
        params: {
          category: "spot",
        },
      }
    );
  });

  it("should return empty array when no trading symbols exist", async () => {
    axios.get.mockResolvedValue({
      data: {
        result: {
          list: [],
        },
      },
    });

    const bybit = new Bybit();

    const result =
      await bybit.getSymbols();

    expect(result).toEqual([]);
  });

  it("should retry when Bybit returns a server error", async () => {
    axios.get
      .mockRejectedValueOnce({
        response: {
          status: 500,
        },
        message: "Server error",
      })
      .mockResolvedValueOnce({
        data: {
          result: {
            list: [
              {
                symbol: "BTCUSDT",
                status: "Trading",
                baseCoin: "BTC",
                quoteCoin: "USDT",
              },
            ],
          },
        },
      });

    const bybit = new Bybit();

    const result =
      await bybit.getSymbols();

    expect(result).toEqual([
      {
        symbol: "BTCUSDT",
        status: "Trading",
        baseAsset: "BTC",
        quoteAsset: "USDT",
      },
    ]);

    expect(axios.get).toHaveBeenCalledTimes(2);
  });
});