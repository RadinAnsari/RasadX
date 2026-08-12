export class FakeExchange {
  constructor() {
    this.callCount = 0;
  }

  async getSymbols() {
    this.callCount++;

    if (this.callCount === 1) {
      return [
        { symbol: "BTCUSDT" },
        { symbol: "ETHUSDT" },
        { symbol: "SOLUSDT" }
      ];
    }

    return [
      { symbol: "BTCUSDT" },
      { symbol: "ETHUSDT" },
      { symbol: "SOLUSDT" },
      { symbol: "ABCUSDT" }
    ];
  }
}