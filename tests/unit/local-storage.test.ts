import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  LEGACY_SAVED_PLAN_KEY,
  SAVED_PLAN_KEY,
  clearSavedPlan,
  createDefaultPlannerDrafts,
  loadSavedPlan,
  savePlan,
  type PlannerDraftsV2,
} from "@/lib/local-storage";
import { createCatalogSnapshot } from "@/workers/protocol";

const catalog = createCatalogSnapshot();

function drafts(): PlannerDraftsV2 {
  const value = createDefaultPlannerDrafts();
  return {
    ...value,
    quick: {
      ...value.quick,
      targetItemId: "sword",
      enchantments: [{ enchantmentId: "mending", level: 1 }],
    },
    inventory: {
      ...value.inventory,
      target: { ...value.inventory.target, itemId: "pickaxe", priorWork: 2 },
    },
  };
}

describe("saved planner drafts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("restores independent incomplete Quick and Inventory drafts", () => {
    const value = drafts();
    expect(savePlan(value)).toEqual({ ok: true });
    expect(loadSavedPlan(catalog)).toEqual(value);
  });

  it("validates stored ids and levels against the active catalog", () => {
    const value = drafts();
    localStorage.setItem(
      SAVED_PLAN_KEY,
      JSON.stringify({
        ...value,
        quick: { ...value.quick, targetItemId: "removed-item" },
      }),
    );
    expect(loadSavedPlan(catalog)).toBeNull();

    localStorage.setItem(
      SAVED_PLAN_KEY,
      JSON.stringify({
        ...value,
        quick: {
          ...value.quick,
          enchantments: [{ enchantmentId: "mending", level: 2 }],
        },
      }),
    );
    expect(loadSavedPlan(catalog)).toBeNull();
  });

  it("migrates a catalog-valid legacy active plan without inventing the other draft", () => {
    const legacy = drafts().quick;
    localStorage.setItem(LEGACY_SAVED_PLAN_KEY, JSON.stringify(legacy));
    const restored = loadSavedPlan(catalog);

    expect(restored?.plannerMode).toBe("quick");
    expect(restored?.quick).toEqual(legacy);
    expect(restored?.inventory).toEqual(createDefaultPlannerDrafts().inventory);
  });

  it("contains quota and privacy-mode write failures", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    expect(savePlan(drafts())).toEqual({
      ok: false,
      error: "Your plan could not be saved in this browser.",
    });
  });

  it("ignores malformed storage and clears both storage versions", () => {
    localStorage.setItem(SAVED_PLAN_KEY, "broken");
    localStorage.setItem(LEGACY_SAVED_PLAN_KEY, "broken");
    expect(loadSavedPlan(catalog)).toBeNull();
    expect(clearSavedPlan()).toEqual({ ok: true });
    expect(localStorage.length).toBe(0);
  });
});
