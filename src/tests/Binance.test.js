import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import axios from "axios";

import { Binance } from "../exchanges/Binance.js";

vi.mock("axios");

describe("Binance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have the correct exchange name", () => {
    const binance = new Binance();

    expect(binance.name).toBe("Binance");
  });

  it("should return normalized symbols", async () => {
    axios.get.mockResolvedValue({
      data: {
        symbols: [
          {
            symbol: "BTCUSDT",
            status: "TRADING",
            baseAsset: "BTC",
            quoteAsset: "USDT",
          },
          {
            symbol: "ETHUSDT",
            status: "TRADING",
            baseAsset: "ETH",
            quoteAsset: "USDT",
          },
        ],
      },
    });

    const binance = new Binance();

    const result =
      await binance.getSymbols();

    expect(result).toEqual([
      {
        symbol: "BTCUSDT",
        status: "TRADING",
        baseAsset: "BTC",
        quoteAsset: "USDT",
      },
      {
        symbol: "ETHUSDT",
        status: "TRADING",
        baseAsset: "ETH",
        quoteAsset: "USDT",
      },
    ]);
  });

  it("should include symbols regardless of status", async () => {
    axios.get.mockResolvedValue({
      data: {
        symbols: [
          {
            symbol: "BTCUSDT",
            status: "TRADING",
            baseAsset: "BTC",
            quoteAsset: "USDT",
          },
          {
            symbol: "OLDUSDT",
            status: "BREAK",
            baseAsset: "OLD",
            quoteAsset: "USDT",
          },
        ],
      },
    });

    const binance = new Binance();

    const result =
      await binance.getSymbols();

    expect(result).toHaveLength(2);

    expect(result[1]).toEqual({
      symbol: "OLDUSDT",
      status: "BREAK",
      baseAsset: "OLD",
      quoteAsset: "USDT",
    });
  });

  it("should call Binance exchangeInfo endpoint", async () => {
    axios.get.mockResolvedValue({
      data: {
        symbols: [],
      },
    });

    const binance = new Binance();

    await binance.getExchangeInfo();

    expect(axios.get).toHaveBeenCalledWith(
      "https://api.binance.com/api/v3/exchangeInfo"
    );
  });

  it("should return empty array when Binance has no symbols", async () => {
    axios.get.mockResolvedValue({
      data: {
        symbols: [],
      },
    });

    const binance = new Binance();

    const result =
      await binance.getSymbols();

    expect(result).toEqual([]);
  });
});