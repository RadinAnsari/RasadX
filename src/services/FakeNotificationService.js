export class FakeNotificationService {
  constructor() {
    this.messages = [];
  }

  async sendNewListing(symbol) {
    this.messages.push(symbol);

    console.log(
      `📨 Notification sent: ${symbol}`
    );
  }
}