import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSavedPlan,
  loadSavedPlan,
  savePlan,
} from "@/lib/local-storage";
import type { PlanStateV1 } from "@/lib/share-state";

const state: PlanStateV1 = {
  schemaVersion: 1,
  plannerMode: "quick",
  optimizeMode: "least-total-levels",
  targetItemId: "",
  enchantments: [],
};

describe("saved plan", () => {
  beforeEach(() => localStorage.clear());

  it("restores an incomplete local draft", () => {
    savePlan(state);
    expect(loadSavedPlan()).toEqual(state);
  });

  it("ignores malformed storage and clears saved state", () => {
    localStorage.setItem("anvilpilot:plan:v1", "broken");
    expect(loadSavedPlan()).toBeNull();
    clearSavedPlan();
    expect(localStorage.length).toBe(0);
  });
});
