import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";

import nodemailer from "nodemailer";

import {
  EmailNotificationService,
} from "../services/EmailNotificationService.js";

vi.mock("nodemailer");

describe("EmailNotificationService", () => {
  let sendMail;

  beforeEach(() => {
    vi.clearAllMocks();

    sendMail = vi.fn();

    nodemailer.createTransport.mockReturnValue({
      sendMail,
    });
  });

  it("should send a new listing email", async () => {
    sendMail.mockResolvedValue({
      messageId: "test-message-id",
    });

    const service =
      new EmailNotificationService({
        host: "smtp.example.com",
        port: 465,
        user: "test@example.com",
        password: "fake-password",
        from: "test@example.com",
        to: "receiver@example.com",
      });

    await service.sendNewListing({
      exchange: "Binance",
      symbol: "BTCUSDT",
    });

    expect(sendMail).toHaveBeenCalledTimes(1);

    expect(sendMail).toHaveBeenCalledWith({
      from: "test@example.com",
      to: "receiver@example.com",
      subject: "🚨 New Listing: Binance BTCUSDT",
      text: expect.stringContaining(
        "Exchange: Binance"
      ),
    });
  });

  it("should include the symbol in email body", async () => {
    sendMail.mockResolvedValue({
      messageId: "test-message-id",
    });

    const service =
      new EmailNotificationService({
        host: "smtp.example.com",
        port: 465,
        user: "test@example.com",
        password: "fake-password",
        from: "test@example.com",
        to: "receiver@example.com",
      });

    await service.sendNewListing({
      exchange: "Bybit",
      symbol: "ABCUSDT",
    });

    const email =
      sendMail.mock.calls[0][0];

    expect(email.text).toContain(
      "Exchange: Bybit"
    );

    expect(email.text).toContain(
      "Symbol: ABCUSDT"
    );
  });

  it("should create SMTP transporter with correct configuration", () => {
    new EmailNotificationService({
      host: "smtp.example.com",
      port: 465,
      user: "test@example.com",
      password: "fake-password",
      from: "test@example.com",
      to: "receiver@example.com",
    });

    expect(
      nodemailer.createTransport
    ).toHaveBeenCalledWith({
      host: "smtp.example.com",
      port: 465,
      secure: true,
      auth: {
        user: "test@example.com",
        pass: "fake-password",
      },
    });
  });

  it("should propagate email errors", async () => {
    sendMail.mockRejectedValue(
      new Error("SMTP connection failed")
    );

    const service =
      new EmailNotificationService({
        host: "smtp.example.com",
        port: 465,
        user: "test@example.com",
        password: "fake-password",
        from: "test@example.com",
        to: "receiver@example.com",
      });

    await expect(
      service.sendNewListing({
        exchange: "Binance",
        symbol: "BTCUSDT",
      })
    ).rejects.toThrow(
      "SMTP connection failed"
    );
  });
});