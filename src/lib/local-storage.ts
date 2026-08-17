import type { CatalogSnapshot } from "@/domain/enchanting/types";
import {
  parsePlanStateObject,
  type InventoryPlanStateV1,
  type QuickPlanStateV1,
} from "./share-state";

export const SAVED_PLAN_KEY = "anvilpilot:planner:v2";
export const LEGACY_SAVED_PLAN_KEY = "anvilpilot:plan:v1";

export type PlannerDraftsV2 = {
  schemaVersion: 2;
  plannerMode: "quick" | "inventory";
  quick: QuickPlanStateV1;
  inventory: InventoryPlanStateV1;
};

export type StorageMutationResult =
  | { ok: true }
  | { ok: false; error: string };

export function createDefaultPlannerDrafts(): PlannerDraftsV2 {
  return {
    schemaVersion: 2,
    plannerMode: "quick",
    quick: {
      schemaVersion: 1,
      plannerMode: "quick",
      optimizeMode: "least-total-levels",
      targetItemId: "",
      enchantments: [],
    },
    inventory: {
      schemaVersion: 1,
      plannerMode: "inventory",
      optimizeMode: "least-total-levels",
      target: {
        id: "target",
        kind: "target",
        itemId: null,
        enchantments: [],
        priorWork: 0,
      },
      sacrifices: [],
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePlannerDrafts(
  value: unknown,
  catalog: CatalogSnapshot,
): PlannerDraftsV2 | null {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 2 ||
    (value.plannerMode !== "quick" && value.plannerMode !== "inventory")
  ) {
    return null;
  }
  const quick = parsePlanStateObject(value.quick, false, catalog);
  const inventory = parsePlanStateObject(value.inventory, false, catalog);
  if (
    !quick.ok ||
    quick.state.plannerMode !== "quick" ||
    !inventory.ok ||
    inventory.state.plannerMode !== "inventory"
  ) {
    return null;
  }
  return {
    schemaVersion: 2,
    plannerMode: value.plannerMode,
    quick: quick.state,
    inventory: inventory.state,
  };
}

export function savePlan(state: PlannerDraftsV2): StorageMutationResult {
  try {
    localStorage.setItem(SAVED_PLAN_KEY, JSON.stringify(state));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Your plan could not be saved in this browser.",
    };
  }
}

export function loadSavedPlan(catalog: CatalogSnapshot): PlannerDraftsV2 | null {
  try {
    const value = localStorage.getItem(SAVED_PLAN_KEY);
    if (value) return parsePlannerDrafts(JSON.parse(value), catalog);

    const legacyValue = localStorage.getItem(LEGACY_SAVED_PLAN_KEY);
    if (!legacyValue) return null;
    const legacy = parsePlanStateObject(JSON.parse(legacyValue), false, catalog);
    if (!legacy.ok) return null;
    const migrated = createDefaultPlannerDrafts();
    return legacy.state.plannerMode === "quick"
      ? { ...migrated, plannerMode: "quick", quick: legacy.state }
      : { ...migrated, plannerMode: "inventory", inventory: legacy.state };
  } catch {
    return null;
  }
}

export function clearSavedPlan(): StorageMutationResult {
  try {
    localStorage.removeItem(SAVED_PLAN_KEY);
    localStorage.removeItem(LEGACY_SAVED_PLAN_KEY);
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "The saved plan could not be cleared in this browser.",
    };
  }
}
