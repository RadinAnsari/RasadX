import { logger } from "../utils/logger.js";

export class ListingMonitor {
  constructor(
    exchange,
    repository,
    notificationServices
  ) {
    this.exchange = exchange;
    this.repository = repository;
    this.notificationServices =
      notificationServices;
  }

  async check() {
    const symbols =
      await this.exchange.getSymbols();

    const currentSymbols = new Set(
      symbols.map((item) => item.symbol)
    );

    const state =
      await this.repository.read();

    const previousSymbols =
      state[this.exchange.name] || [];

    // First run for this exchange
    if (previousSymbols.length === 0) {
      state[this.exchange.name] = [
        ...currentSymbols,
      ];

      await this.repository.write(state);

      logger.info(
        "Initial sync completed",
        {
          exchange: this.exchange.name,
          symbols: currentSymbols.size,
        }
      );

      return [];
    }

    const previousSet =
      new Set(previousSymbols);

    const newListings = [];

    for (const symbol of currentSymbols) {
      if (!previousSet.has(symbol)) {
        newListings.push(symbol);

        logger.info(
          "New listing detected",
          {
            exchange: this.exchange.name,
            symbol,
          }
        );
      }
    }

    // Update state
    state[this.exchange.name] = [
      ...currentSymbols,
    ];

    await this.repository.write(state);

    // Send notifications
    for (const symbol of newListings) {
      for (
        const notificationService
        of this.notificationServices
      ) {
        try {
          await notificationService.sendNewListing({
            exchange: this.exchange.name,
            symbol,
          });
        } catch (error) {
          logger.error(
            "Notification failed",
            {
              exchange: this.exchange.name,
              symbol,
              error: error.message,
            }
          );
        }
      }
    }

    return newListings;
  }
}