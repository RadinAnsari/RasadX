import {
  describe,
  it,
  expect,
  vi,
} from "vitest";

import { retry } from "../utils/retry.js";

describe("retry", () => {
  it("should return result when function succeeds", async () => {
    const fn = vi
      .fn()
      .mockResolvedValue("success");

    const result = await retry(fn, {
      retries: 3,
      delay: 0,
    });

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry when function fails", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(
        new Error("Network error")
      )
      .mockResolvedValue("success");

    const result = await retry(fn, {
      retries: 3,
      delay: 0,
    });

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should retry multiple times before succeeding", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(
        new Error("Error 1")
      )
      .mockRejectedValueOnce(
        new Error("Error 2")
      )
      .mockResolvedValue("success");

    const result = await retry(fn, {
      retries: 3,
      delay: 0,
    });

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("should throw error after all retries fail", async () => {
    const error = new Error(
      "Connection failed"
    );

    const fn = vi
      .fn()
      .mockRejectedValue(error);

    await expect(
      retry(fn, {
        retries: 3,
        delay: 0,
      })
    ).rejects.toThrow(
      "Connection failed"
    );

    expect(fn).toHaveBeenCalledTimes(4);
  });

  it("should not retry when shouldRetry returns false", async () => {
    const error = new Error(
      "Bad request"
    );

    const fn = vi
      .fn()
      .mockRejectedValue(error);

    await expect(
      retry(fn, {
        retries: 3,
        delay: 0,

        shouldRetry: () => false,
      })
    ).rejects.toThrow(
      "Bad request"
    );

    expect(fn).toHaveBeenCalledTimes(1);
  });
});