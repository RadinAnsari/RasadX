import {
  describe,
  it,
  expect,
} from "vitest";

import { ListingMonitor } from "../services/ListingMonitor.js";

class FakeExchange {
  constructor(name, symbols) {
    this.name = name;
    this.symbols = symbols;
  }

  async getSymbols() {
    return this.symbols.map((symbol) => ({
      symbol,
    }));
  }
}

class FakeRepository {
  constructor(state = {}) {
    this.state = state;
  }

  async read() {
    return this.state;
  }

  async write(data) {
    this.state = data;
  }
}

class FakeNotification {
  constructor() {
    this.notifications = [];
  }

  async sendNewListing(data) {
    this.notifications.push(data);
  }
}

describe("ListingMonitor", () => {
  it("should initialize exchange state on first run", async () => {
    const exchange = new FakeExchange(
      "Binance",
      [
        "BTCUSDT",
        "ETHUSDT",
        "SOLUSDT",
      ]
    );

    const repository =
      new FakeRepository();

    const notification =
      new FakeNotification();

    const monitor = new ListingMonitor(
      exchange,
      repository,
      [notification]
    );

    const result =
      await monitor.check();

    expect(result).toEqual([]);

    expect(repository.state).toEqual({
      Binance: [
        "BTCUSDT",
        "ETHUSDT",
        "SOLUSDT",
      ],
    });

    expect(
      notification.notifications
    ).toHaveLength(0);
  });

  it("should detect a new listing", async () => {
    const exchange = new FakeExchange(
      "Binance",
      [
        "BTCUSDT",
        "ETHUSDT",
        "SOLUSDT",
      ]
    );

    const repository =
      new FakeRepository({
        Binance: [
          "BTCUSDT",
          "ETHUSDT",
        ],
      });

    const notification =
      new FakeNotification();

    const monitor = new ListingMonitor(
      exchange,
      repository,
      [notification]
    );

    const result =
      await monitor.check();

    expect(result).toEqual([
      "SOLUSDT",
    ]);

    expect(
      notification.notifications
    ).toEqual([
      {
        exchange: "Binance",
        symbol: "SOLUSDT",
      },
    ]);
  });

  it("should not notify for an existing listing", async () => {
    const exchange = new FakeExchange(
      "Binance",
      [
        "BTCUSDT",
        "ETHUSDT",
        "SOLUSDT",
      ]
    );

    const repository =
      new FakeRepository({
        Binance: [
          "BTCUSDT",
          "ETHUSDT",
          "SOLUSDT",
        ],
      });

    const notification =
      new FakeNotification();

    const monitor = new ListingMonitor(
      exchange,
      repository,
      [notification]
    );

    const result =
      await monitor.check();

    expect(result).toEqual([]);

    expect(
      notification.notifications
    ).toHaveLength(0);
  });

  it("should notify all notification services", async () => {
    const exchange = new FakeExchange(
      "Binance",
      [
        "BTCUSDT",
        "ETHUSDT",
        "SOLUSDT",
      ]
    );

    const repository =
      new FakeRepository({
        Binance: [
          "BTCUSDT",
          "ETHUSDT",
        ],
      });

    const telegram =
      new FakeNotification();

    const email =
      new FakeNotification();

    const monitor = new ListingMonitor(
      exchange,
      repository,
      [
        telegram,
        email,
      ]
    );

    await monitor.check();

    expect(
      telegram.notifications
    ).toEqual([
      {
        exchange: "Binance",
        symbol: "SOLUSDT",
      },
    ]);

    expect(
      email.notifications
    ).toEqual([
      {
        exchange: "Binance",
        symbol: "SOLUSDT",
      },
    ]);
  });

  it("should keep Binance and Bybit state separate", async () => {
    const repository =
      new FakeRepository({
        Binance: [
          "BTCUSDT",
          "ETHUSDT",
        ],

        Bybit: [
          "BTCUSDT",
          "SOLUSDT",
        ],
      });

    const exchange =
      new FakeExchange(
        "Binance",
        [
          "BTCUSDT",
          "ETHUSDT",
          "BNBUSDT",
        ]
      );

    const notification =
      new FakeNotification();

    const monitor = new ListingMonitor(
      exchange,
      repository,
      [notification]
    );

    const result =
      await monitor.check();

    expect(result).toEqual([
      "BNBUSDT",
    ]);

    expect(repository.state).toEqual({
      Binance: [
        "BTCUSDT",
        "ETHUSDT",
        "BNBUSDT",
      ],

      Bybit: [
        "BTCUSDT",
        "SOLUSDT",
      ],
    });
  });
});