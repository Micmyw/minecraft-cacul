import { describe, expect, it } from "vitest";
import { nextPriorWork, priorWorkPenalty } from "@/domain/enchanting/prior-work";

describe("prior work", () => {
  it("uses Minecraft's exponential prior-work penalty", () => {
    expect(priorWorkPenalty(0)).toBe(0);
    expect(priorWorkPenalty(1)).toBe(1);
    expect(priorWorkPenalty(3)).toBe(7);
  });

  it("increments the larger input prior-work count", () => {
    expect(nextPriorWork(1, 3)).toBe(4);
  });
});
