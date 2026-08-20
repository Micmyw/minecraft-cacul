import { afterEach, describe, expect, it, vi } from "vitest";
import {
  analyticsConsentStorageKey,
} from "@/components/site-analytics";
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
  consent?: string | null;
  gtag?: ReturnType<typeof vi.fn> | undefined;
  readConsent?: () => string | null;
} = {}) {
  const {
    hostname = "enchantmentcalculator.com",
    consent = "accepted",
    readConsent,
  } = options;
  const gtag = Object.hasOwn(options, "gtag") ? options.gtag : vi.fn();
  const getItem = readConsent ?? vi.fn(() => consent);
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
  it("does not dispatch without accepted consent or after rejection", () => {
    const missing = stubAnalyticsWindow({ consent: null });
    expect(trackProductEvent("calculation_success", allowedParams)).toBe(false);
    expect(missing.gtag).not.toHaveBeenCalled();

    const rejected = stubAnalyticsWindow({ consent: "rejected" });
    expect(trackProductEvent("calculation_success", allowedParams)).toBe(false);
    expect(rejected.gtag).not.toHaveBeenCalled();
  });

  it("does not dispatch on localhost or when gtag is unavailable", () => {
    const local = stubAnalyticsWindow({ hostname: "localhost" });
    expect(trackProductEvent("calculator_start", allowedParams)).toBe(false);
    expect(local.gtag).not.toHaveBeenCalled();

    stubAnalyticsWindow({ gtag: undefined });
    expect(trackProductEvent("calculator_start", allowedParams)).toBe(false);
  });

  it("sends one event with only the controlled parameter properties", () => {
    const { getItem, gtag } = stubAnalyticsWindow();
    const unsafeInput = {
      ...allowedParams,
      example_type: "maxed_sword",
      plan: { targetItemId: "sword" },
      user_input: "private text",
    } as ProductAnalyticsParams;

    expect(trackProductEvent("example_loaded", unsafeInput)).toBe(true);
    expect(getItem).toHaveBeenCalledWith(analyticsConsentStorageKey);
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

  it("returns false without throwing when window or LocalStorage is unavailable", () => {
    vi.stubGlobal("window", undefined);
    expect(() => trackProductEvent("calculator_start", allowedParams)).not.toThrow();
    expect(trackProductEvent("calculator_start", allowedParams)).toBe(false);

    stubAnalyticsWindow({
      readConsent: () => {
        throw new DOMException("Blocked", "SecurityError");
      },
    });
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
