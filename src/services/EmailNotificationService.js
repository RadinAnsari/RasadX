import nodemailer from "nodemailer";
import { logger } from "../utils/logger.js";

export class EmailNotificationService {
  constructor({
    host,
    port,
    user,
    password,
    from,
    to,
  }) {
    this.from = from;
    this.to = to;

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,

      auth: {
        user,
        pass: password,
      },
    });
  }

  async sendNewListing({
    exchange,
    symbol,
  }) {
    const subject =
      `🚨 New Listing: ${exchange} ${symbol}`;

    const text = `
New cryptocurrency listing detected.

Exchange: ${exchange}
Symbol: ${symbol}
Time: ${new Date().toISOString()}
`;

    await this.transporter.sendMail({
      from: this.from,
      to: this.to,
      subject,
      text,
    });

    logger.info("Email notification sent", {
      exchange,
      symbol,
    });
  }
}