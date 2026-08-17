import { describe, expect, it, vi } from "vitest";
import { SearchCancelledError } from "@/domain/enchanting/search-common";
import { solve } from "@/domain/enchanting/solver";
import { request } from "../fixtures/ingredients";

describe("cooperative search control", () => {
  it("reports monotonic progress", async () => {
    const progress: number[] = [];
    await solve(request(), {
      onProgress: (event) => progress.push(event.progress),
      yieldControl: async () => {},
    });
    expect(progress.length).toBeGreaterThan(0);
    expect(progress.at(-1)).toBe(1);
    expect(progress).toEqual([...progress].sort((left, right) => left - right));
  });

  it("honors cancellation at a cooperative checkpoint", async () => {
    const yielded = vi.fn(async () => {});
    await expect(
      solve(request(), { isCancelled: () => true, yieldControl: yielded }),
    ).rejects.toBeInstanceOf(SearchCancelledError);
  });
});
