import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "vitest";

import fs from "fs/promises";
import os from "os";
import path from "path";

import { JsonRepository } from "../repositories/JsonRepository.js";

describe("JsonRepository", () => {
  let filePath;
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(
      path.join(
        os.tmpdir(),
        "listing-alert-"
      )
    );

    filePath = path.join(
      tempDir,
      "symbols.json"
    );
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, {
        recursive: true,
        force: true,
      });
    } catch {
      // Ignore cleanup errors
    }
  });

  it("should write and read data", async () => {
    const repository =
      new JsonRepository(filePath);

    const state = {
      Binance: [
        "BTCUSDT",
        "ETHUSDT",
        "SOLUSDT",
      ],

      Bybit: [
        "BTCUSDT",
        "ETHUSDT",
      ],
    };

    await repository.write(state);

    const result =
      await repository.read();

    expect(result).toEqual(state);
  });

  it("should return an empty object if file does not exist", async () => {
    const repository =
      new JsonRepository(filePath);

    const result =
      await repository.read();

    expect(result).toEqual({});
  });
});