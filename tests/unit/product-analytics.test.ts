import { afterEach, describe, expect, it, vi } from "vitest";
import {
  bucketBookCount,
  trackProductEvent,
  type ProductAnalyticsParams,
} from "@/lib/product-analytics";

const allowedParams: ProductAnalyticsParams = {
  planner_mode: "quick",
  optimization_mode: "least_total_levels",
  result_quality: "exact_optimal",
  result_status: "success",
  book_count_bucket: "4-6",
};

function stubAnalyticsWindow(options: {
  hostname?: string;
  gtag?: ReturnType<typeof vi.fn> | undefined;
  readStorage?: () => string | null;
} = {}) {
  const {
    hostname = "enchantmentcalculator.com",
    readStorage,
  } = options;
  const gtag = Object.hasOwn(options, "gtag") ? options.gtag : vi.fn();
  const getItem = vi.fn(readStorage ?? (() => null));
  vi.stubGlobal("window", {
    location: { hostname },
    localStorage: { getItem },
    gtag,
  });
  return { getItem, gtag };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("product analytics privacy boundary", () => {
  it("dispatches on production without reading consent from LocalStorage", () => {
    const { getItem, gtag } = stubAnalyticsWindow({
      readStorage: () => {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
    expect(trackProductEvent("calculation_success", allowedParams)).toBe(true);
    expect(getItem).not.toHaveBeenCalled();
    expect(gtag).toHaveBeenCalledOnce();
  });

  it("does not dispatch on localhost or when gtag is unavailable", () => {
    const local = stubAnalyticsWindow({ hostname: "localhost" });
    expect(trackProductEvent("calculator_start", allowedParams)).toBe(false);
    expect(local.gtag).not.toHaveBeenCalled();

    stubAnalyticsWindow({ gtag: undefined });
    expect(trackProductEvent("calculator_start", allowedParams)).toBe(false);
  });

  it("sends one event with only the controlled parameter properties", () => {
    const { gtag } = stubAnalyticsWindow();
    const unsafeInput = {
      ...allowedParams,
      example_type: "maxed_sword",
      plan: { targetItemId: "sword" },
      user_input: "private text",
    } as ProductAnalyticsParams;

    expect(trackProductEvent("example_loaded", unsafeInput)).toBe(true);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith("event", "example_loaded", {
      planner_mode: "quick",
      optimization_mode: "least_total_levels",
      result_quality: "exact_optimal",
      result_status: "success",
      book_count_bucket: "4-6",
      example_type: "maxed_sword",
    });
  });

  it("returns false without throwing when window is unavailable", () => {
    vi.stubGlobal("window", undefined);
    expect(() => trackProductEvent("calculator_start", allowedParams)).not.toThrow();
    expect(trackProductEvent("calculator_start", allowedParams)).toBe(false);
  });
});

describe("book count bucketing", () => {
  it.each([
    [-1, "0"],
    [0, "0"],
    [1, "1-3"],
    [3, "1-3"],
    [4, "4-6"],
    [6, "4-6"],
    [7, "7-8"],
    [8, "7-8"],
    [9, "9+"],
    [32, "9+"],
  ] as const)("maps %i books to %s", (count, expected) => {
    expect(bucketBookCount(count)).toBe(expected);
  });
});
