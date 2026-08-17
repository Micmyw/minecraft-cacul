import { describe, expect, it } from "vitest";
import { nextPriorWork, priorWorkPenalty } from "@/domain/enchanting/prior-work";
import { MAX_PRIOR_WORK } from "@/domain/enchanting/types";
import { validateSolveRequest } from "@/domain/enchanting/validation";
import { ingredient, request } from "../fixtures/ingredients";

describe("prior work", () => {
  it("uses Minecraft's exponential prior-work penalty", () => {
    expect(priorWorkPenalty(0)).toBe(0);
    expect(priorWorkPenalty(1)).toBe(1);
    expect(priorWorkPenalty(3)).toBe(7);
  });

  it("increments the larger input prior-work count", () => {
    expect(nextPriorWork(1, 3)).toBe(4);
  });

  it("accepts only safe integers within the public prior-work limit", () => {
    for (const priorWork of [1.5, Number.MAX_SAFE_INTEGER + 1, MAX_PRIOR_WORK + 1]) {
      const errors = validateSolveRequest(
        request({
          target: ingredient({ id: "target", kind: "target", priorWork }),
        }),
      );
      expect(errors.join(" ")).toContain(`between 0 and ${MAX_PRIOR_WORK}`);
    }
  });
});
