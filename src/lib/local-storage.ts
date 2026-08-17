import {
  parsePlanStateObject,
  type PlanStateV1,
} from "./share-state";

export const SAVED_PLAN_KEY = "anvilpilot:plan:v1";

export function savePlan(state: PlanStateV1): void {
  localStorage.setItem(SAVED_PLAN_KEY, JSON.stringify(state));
}

export function loadSavedPlan(): PlanStateV1 | null {
  try {
    const value = localStorage.getItem(SAVED_PLAN_KEY);
    if (!value) return null;
    const parsed = parsePlanStateObject(JSON.parse(value), false);
    return parsed.ok ? parsed.state : null;
  } catch {
    return null;
  }
}

export function clearSavedPlan(): void {
  localStorage.removeItem(SAVED_PLAN_KEY);
}
