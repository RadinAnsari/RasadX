import TelegramBot from "node-telegram-bot-api";

export class TelegramNotificationService {
  constructor(token, chatId) {
    this.chatId = chatId;
    this.bot = new TelegramBot(token);
  }

  async sendNewListing({ exchange, symbol }) {
    const message = `
🚨 NEW LISTING

Exchange: ${exchange}
Symbol: ${symbol}
Time: ${new Date().toISOString()}
`;

    await this.bot.sendMessage(
      this.chatId,
      message
    );
  }
}