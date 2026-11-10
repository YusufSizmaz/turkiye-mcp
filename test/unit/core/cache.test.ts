import { describe, expect, it, vi } from "vitest";
import { cached } from "../../../src/core/cache.js";
import "../../helpers.js";

describe("cached", () => {
  it("eşzamanlı aynı anahtar tek istek yapar", async () => {
    const fn = vi.fn(async () => 42);
    const [a, b] = await Promise.all([cached("k", 60, fn), cached("k", 60, fn)]);
    expect(a).toBe(42);
    expect(b).toBe(42);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("TTL dolunca yeniden çağırır", async () => {
    vi.useFakeTimers();
    const fn = vi.fn(async () => 1);
    await cached("t", 10, fn);
    await cached("t", 10, fn);
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(11_000);
    await cached("t", 10, fn);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("hata önbelleğe alınmaz", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("x")).mockResolvedValueOnce(5);
    await expect(cached("e", 60, fn)).rejects.toThrow("x");
    expect(await cached("e", 60, fn)).toBe(5);
  });
});
