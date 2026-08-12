export class FailingExchange {
  async getSymbols() {
    throw new Error("Binance API is unavailable");
  }
}