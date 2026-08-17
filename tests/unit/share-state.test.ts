import { describe, expect, it } from "vitest";
import {
  decodePlanState,
  encodePlanState,
  planStateToSolveRequest,
  type PlanStateV1,
} from "@/lib/share-state";
import { ingredient } from "../fixtures/ingredients";
import { createCatalogSnapshot } from "@/workers/protocol";

const catalog = createCatalogSnapshot();

const quickState: PlanStateV1 = {
  schemaVersion: 1,
  plannerMode: "quick",
  optimizeMode: "least-total-levels",
  targetItemId: "sword",
  enchantments: [
    { enchantmentId: "sharpness", level: 5 },
    { enchantmentId: "mending", level: 1 },
  ],
};

describe("share state", () => {
  it("round trips a versioned Quick Plan", () => {
    const encoded = encodePlanState(quickState);
    expect(encoded.startsWith("v1.")).toBe(true);
    expect(decodePlanState(encoded, catalog)).toEqual({ ok: true, state: quickState });
  });

  it("round trips a versioned Inventory Plan", () => {
    const state: PlanStateV1 = {
      schemaVersion: 1,
      plannerMode: "inventory",
      optimizeMode: "preserve-future-work",
      target: ingredient({ id: "target", kind: "target", priorWork: 1 }),
      sacrifices: [
        ingredient({
          id: "mixed-book",
          kind: "book",
          priorWork: 2,
          enchantments: [
            { enchantmentId: "power", level: 5 },
            { enchantmentId: "mending", level: 1 },
          ],
        }),
      ],
    };
    expect(decodePlanState(encodePlanState(state), catalog)).toEqual({ ok: true, state });
  });

  it("converts Quick Plan selections into fresh single-enchantment books", () => {
    const solveRequest = planStateToSolveRequest(quickState);
    expect(solveRequest.target).toMatchObject({ kind: "target", priorWork: 0 });
    expect(solveRequest.sacrifices).toEqual([
      {
        id: "quick-book-sharpness",
        kind: "book",
        itemId: null,
        enchantments: [{ enchantmentId: "sharpness", level: 5 }],
        priorWork: 0,
      },
      {
        id: "quick-book-mending",
        kind: "book",
        itemId: null,
        enchantments: [{ enchantmentId: "mending", level: 1 }],
        priorWork: 0,
      },
    ]);
  });

  it("rejects corrupted, unknown, and unversioned share state", () => {
    expect(decodePlanState("not-a-plan", catalog)).toMatchObject({ ok: false });
    expect(decodePlanState("v1.not-base64!", catalog)) .toMatchObject({ ok: false });
    const unknown = { ...quickState, targetItemId: "unknown-item" };
    expect(decodePlanState(encodePlanState(unknown), catalog)).toEqual({
      ok: false,
      error: 'Unknown item "unknown-item".',
    });
  });

  it("fully validates compatibility and Inventory invariants after decoding", () => {
    const conflicting: PlanStateV1 = {
      ...quickState,
      enchantments: [
        { enchantmentId: "sharpness", level: 5 },
        { enchantmentId: "smite", level: 5 },
      ],
    };
    expect(decodePlanState(encodePlanState(conflicting), catalog)).toMatchObject({
      ok: false,
      error: expect.stringContaining("cannot be used together"),
    });

    const invalidInventory: PlanStateV1 = {
      schemaVersion: 1,
      plannerMode: "inventory",
      optimizeMode: "least-total-levels",
      target: ingredient({ id: "target", kind: "target", priorWork: -1 }),
      sacrifices: [
        ingredient({
          id: "wrong-item",
          kind: "item",
          itemId: "bow",
          enchantments: [{ enchantmentId: "power", level: 5 }],
        }),
      ],
    };
    expect(decodePlanState(encodePlanState(invalidInventory), catalog)).toMatchObject({
      ok: false,
    });
  });
});
