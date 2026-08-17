import type { EnchantmentLevel, Ingredient, SolveRequest } from "@/domain/enchanting/types";
import { ingredient, request } from "./ingredients";

export type GoldenExpectation =
  | {
      status: "success";
      quality: "exact-optimal" | "best-found";
      totalLevels?: number;
      stepCosts?: number[];
      normalizedSteps?: string[];
      upstreamStepCostMultiset?: number[];
      finalPriorWork?: number;
      warningIncludes?: string;
    }
  | {
      status: "no-legal-plan";
      quality: "exact-optimal" | "best-found";
      stepCosts: number[];
    }
  | {
      status: "invalid-input";
      errorIncludes: string;
    };

export type GoldenSolveScenario = {
  name: string;
  source: "upstream-comparable" | "anvilpilot-extension" | "validation-boundary";
  rationale: string;
  request: SolveRequest;
  expected: GoldenExpectation;
};

function enchantedBook(
  enchantmentId: string,
  level: number,
  overrides: Partial<Ingredient> = {},
): Ingredient {
  return ingredient({
    id: enchantmentId,
    kind: "book",
    enchantments: [{ enchantmentId, level }],
    ...overrides,
  });
}

function quickRequest(
  itemId: string,
  enchantments: Array<[string, number]>,
): SolveRequest {
  return request({
    target: ingredient({ id: "target", kind: "target", itemId }),
    sacrifices: enchantments.map(([id, level]) => enchantedBook(id, level)),
  });
}

function normalized(left: string, right: string, cost: number): string {
  return `${left}>${right}@${cost}`;
}

const eightBooks = Array.from({ length: 8 }, (_, index) =>
  enchantedBook(`book-${index + 1}`, 3, {
    enchantments: [{ enchantmentId: "unbreaking", level: 3 }],
  }),
);

const nineBooks = Array.from({ length: 9 }, (_, index) =>
  enchantedBook(`book-${index + 1}`, 3, {
    enchantments: [{ enchantmentId: "unbreaking", level: 3 }],
  }),
);

/**
 * Fixed v1 acceptance scenarios. The first six were captured from the pinned
 * iamcal/enchant-order commit. They use data and an objective for which the
 * displayed-level result agrees, so the complete normalized work order is
 * compared. Inventory-only cases assert the new rules directly and are not
 * presented as upstream-supported behavior.
 */
export const goldenSolveScenarios: readonly GoldenSolveScenario[] = [
  {
    name: "upstream sword work order",
    source: "upstream-comparable",
    rationale: "Fresh single-enchantment books; displayed-level optimum agrees with the pinned upstream result.",
    request: quickRequest("sword", [["sharpness", 5], ["looting", 3], ["unbreaking", 3], ["mending", 1]]),
    expected: {
      status: "success",
      quality: "exact-optimal",
      totalLevels: 23,
      stepCosts: [6, 2, 7, 8],
      normalizedSteps: [
        normalized("target", "looting", 6),
        normalized("unbreaking", "mending", 2),
        normalized("(target+looting)", "(unbreaking+mending)", 7),
        normalized("((target+looting)+(unbreaking+mending))", "sharpness", 8),
      ],
      finalPriorWork: 3,
    },
  },
  {
    name: "upstream fortune pickaxe work order",
    source: "upstream-comparable",
    rationale: "Fresh books and unchanged shared cost rules.",
    request: quickRequest("pickaxe", [["efficiency", 5], ["fortune", 3], ["unbreaking", 3], ["mending", 1]]),
    expected: {
      status: "success",
      quality: "exact-optimal",
      totalLevels: 23,
      stepCosts: [6, 2, 7, 8],
      normalizedSteps: [
        normalized("target", "fortune", 6),
        normalized("unbreaking", "mending", 2),
        normalized("(target+fortune)", "(unbreaking+mending)", 7),
        normalized("((target+fortune)+(unbreaking+mending))", "efficiency", 8),
      ],
      finalPriorWork: 3,
    },
  },
  {
    name: "upstream silk touch pickaxe work order",
    source: "upstream-comparable",
    rationale: "Fresh books and unchanged shared cost rules.",
    request: quickRequest("pickaxe", [["efficiency", 5], ["silk_touch", 1], ["unbreaking", 3], ["mending", 1]]),
    expected: {
      status: "success",
      quality: "exact-optimal",
      totalLevels: 21,
      stepCosts: [5, 2, 7, 7],
      normalizedSteps: [
        normalized("target", "efficiency", 5),
        normalized("unbreaking", "mending", 2),
        normalized("(target+efficiency)", "(unbreaking+mending)", 7),
        normalized("((target+efficiency)+(unbreaking+mending))", "silk_touch", 7),
      ],
      finalPriorWork: 3,
    },
  },
  {
    name: "upstream bow work order",
    source: "upstream-comparable",
    rationale: "Uses Infinity rather than Mending and matches the pinned upstream work tree.",
    request: quickRequest("bow", [["power", 5], ["punch", 2], ["flame", 1], ["unbreaking", 3], ["infinity", 1]]),
    expected: {
      status: "success",
      quality: "exact-optimal",
      totalLevels: 29,
      stepCosts: [5, 3, 9, 2, 10],
      normalizedSteps: [
        normalized("target", "power", 5),
        normalized("infinity", "unbreaking", 3),
        normalized("(target+power)", "(infinity+unbreaking)", 9),
        normalized("punch", "flame", 2),
        normalized("((target+power)+(infinity+unbreaking))", "(punch+flame)", 10),
      ],
      finalPriorWork: 3,
    },
  },
  {
    name: "upstream mace work order",
    source: "upstream-comparable",
    rationale: "Java 26.2 Mace data and displayed-level costs agree with the pinned upstream case.",
    request: quickRequest("mace", [["density", 5], ["wind_burst", 3], ["unbreaking", 3], ["mending", 1]]),
    expected: {
      status: "success",
      quality: "exact-optimal",
      totalLevels: 23,
      stepCosts: [6, 2, 7, 8],
      normalizedSteps: [
        normalized("target", "wind_burst", 6),
        normalized("unbreaking", "mending", 2),
        normalized("(target+wind_burst)", "(unbreaking+mending)", 7),
        normalized("((target+wind_burst)+(unbreaking+mending))", "density", 8),
      ],
      finalPriorWork: 3,
    },
  },
  {
    name: "upstream spear and lunge work order",
    source: "upstream-comparable",
    rationale: "The pinned upstream build orders equal-total subtrees by converted XP; v1 uses its specified normalized-step tie-break. Total cost and the shared cost multiset still agree.",
    request: quickRequest("spear", [["sharpness", 5], ["looting", 3], ["lunge", 3], ["unbreaking", 3], ["mending", 1]]),
    expected: {
      status: "success",
      quality: "exact-optimal",
      totalLevels: 30,
      stepCosts: [6, 3, 10, 2, 9],
      normalizedSteps: [
        normalized("target", "looting", 6),
        normalized("sharpness", "lunge", 3),
        normalized("(target+looting)", "(sharpness+lunge)", 10),
        normalized("unbreaking", "mending", 2),
        normalized("((target+looting)+(sharpness+lunge))", "(unbreaking+mending)", 9),
      ],
      upstreamStepCostMultiset: [2, 3, 6, 9, 10],
      finalPriorWork: 3,
    },
  },
  {
    name: "mixed book discards an inapplicable enchantment",
    source: "anvilpilot-extension",
    rationale: "Mixed Inventory books are outside the upstream Quick-only comparison surface.",
    request: request({
      sacrifices: [ingredient({ id: "mixed", kind: "book", enchantments: [
        { enchantmentId: "sharpness", level: 5 },
        { enchantmentId: "power", level: 5 },
        { enchantmentId: "mending", level: 1 },
      ] })],
    }),
    expected: { status: "success", quality: "exact-optimal", totalLevels: 7, stepCosts: [7], finalPriorWork: 1, warningIncludes: "discarded" },
  },
  {
    name: "target with one prior work",
    source: "anvilpilot-extension",
    rationale: "Inventory target prior work is validated against the Java penalty formula.",
    request: request({ target: ingredient({ id: "target", kind: "target", priorWork: 1 }) }),
    expected: { status: "success", quality: "exact-optimal", totalLevels: 3, stepCosts: [3], finalPriorWork: 2 },
  },
  {
    name: "books with different prior work",
    source: "anvilpilot-extension",
    rationale: "Inventory sacrifice histories are preserved independently and influence the recommended order.",
    request: request({ sacrifices: [
      enchantedBook("sharpness", 5, { priorWork: 1 }),
      enchantedBook("mending", 1, { priorWork: 2 }),
    ] }),
    expected: { status: "success", quality: "exact-optimal", totalLevels: 14, stepCosts: [6, 8], finalPriorWork: 3 },
  },
  {
    name: "forty-level step is Too Expensive",
    source: "anvilpilot-extension",
    rationale: "A complete diagnostic plan must be returned when Survival has no legal plan.",
    request: request({
      target: ingredient({ id: "target", kind: "target", priorWork: 5 }),
      sacrifices: [enchantedBook("mending", 1, { priorWork: 3 })],
    }),
    expected: { status: "no-legal-plan", quality: "exact-optimal", stepCosts: [40] },
  },
  {
    name: "fortune and silk touch conflict",
    source: "validation-boundary",
    rationale: "Globally incompatible target enchantments are rejected before search.",
    request: quickRequest("pickaxe", [["fortune", 3], ["silk_touch", 1]]),
    expected: { status: "invalid-input", errorIncludes: "cannot be used together" },
  },
  {
    name: "sharpness and smite conflict",
    source: "validation-boundary",
    rationale: "Weapon damage exclusivity is rejected before search.",
    request: quickRequest("sword", [["sharpness", 5], ["smite", 5]]),
    expected: { status: "invalid-input", errorIncludes: "cannot be used together" },
  },
  {
    name: "single fresh book",
    source: "anvilpilot-extension",
    rationale: "Smallest valid complete plan.",
    request: request(),
    expected: { status: "success", quality: "exact-optimal", totalLevels: 2, stepCosts: [2], finalPriorWork: 1 },
  },
  {
    name: "eight-sacrifice exact boundary",
    source: "validation-boundary",
    rationale: "Eight sacrifices must still complete exhaustive search.",
    request: request({ sacrifices: eightBooks }),
    expected: { status: "success", quality: "exact-optimal" },
  },
  {
    name: "nine-sacrifice heuristic boundary",
    source: "validation-boundary",
    rationale: "Nine sacrifices must use deterministic Best Found search.",
    request: request({ sacrifices: nineBooks }),
    expected: { status: "success", quality: "best-found" },
  },
  {
    name: "unknown enchantment id",
    source: "validation-boundary",
    rationale: "Unknown data identifiers are rejected before search.",
    request: request({ sacrifices: [enchantedBook("not_real", 1)] }),
    expected: { status: "invalid-input", errorIncludes: "Unknown enchantment" },
  },
  {
    name: "enchantment above maximum level",
    source: "validation-boundary",
    rationale: "Over-level enchantments are invalid input.",
    request: request({ sacrifices: [enchantedBook("unbreaking", 4)] }),
    expected: { status: "invalid-input", errorIncludes: "supports levels 1–3" },
  },
  {
    name: "plan without sacrifices",
    source: "validation-boundary",
    rationale: "A target by itself is not a plan.",
    request: request({ sacrifices: [] }),
    expected: { status: "invalid-input", errorIncludes: "Add at least one" },
  },
  {
    name: "same-type item sacrifice",
    source: "anvilpilot-extension",
    rationale: "Inventory supports Item to same-type Item in the target-preserving direction.",
    request: request({ sacrifices: [ingredient({ id: "sword-item", kind: "item", enchantments: [{ enchantmentId: "sharpness", level: 5 }] })] }),
    expected: { status: "success", quality: "exact-optimal", totalLevels: 5, stepCosts: [5], finalPriorWork: 1 },
  },
  {
    name: "same-level enchantments upgrade",
    source: "anvilpilot-extension",
    rationale: "Equal levels upgrade by one while respecting the maximum.",
    request: request({
      target: ingredient({ id: "target", kind: "target", enchantments: [{ enchantmentId: "sharpness", level: 4 }] }),
      sacrifices: [enchantedBook("sharpness-book", 4, { enchantments: [{ enchantmentId: "sharpness", level: 4 }] })],
    }),
    expected: { status: "success", quality: "exact-optimal", totalLevels: 5, stepCosts: [5], finalPriorWork: 1 },
  },
  {
    name: "book with no applicable enchantments",
    source: "validation-boundary",
    rationale: "A sacrifice that cannot change the target is invalid rather than silently consumed.",
    request: request({ sacrifices: [enchantedBook("power", 5)] }),
    expected: { status: "invalid-input", errorIncludes: "has no enchantment that can apply" },
  },
  {
    name: "duplicate ingredient ids",
    source: "validation-boundary",
    rationale: "Stable identity is required for deterministic trees and sharing.",
    request: request({ sacrifices: [enchantedBook("duplicate", 1, { enchantments: [{ enchantmentId: "mending", level: 1 }] }), enchantedBook("duplicate", 3, { enchantments: [{ enchantmentId: "unbreaking", level: 3 }] })] }),
    expected: { status: "invalid-input", errorIncludes: "unique id" },
  },
  {
    name: "more than thirty-two sacrifices",
    source: "validation-boundary",
    rationale: "The public Inventory boundary is capped at 32 sacrifices.",
    request: request({ sacrifices: Array.from({ length: 33 }, (_, index) => enchantedBook(`limit-${index}`, 1, { enchantments: [{ enchantmentId: "mending", level: 1 }] })) }),
    expected: { status: "invalid-input", errorIncludes: "at most 32" },
  },
] as const;

export const shareStateFixtures = [
  {
    name: "valid v1 quick state",
    value: {
      schemaVersion: 1,
      plannerMode: "quick",
      optimizeMode: "least-total-levels",
      targetItemId: "sword",
      enchantments: [{ enchantmentId: "sharpness", level: 5 }] satisfies EnchantmentLevel[],
    },
    valid: true,
  },
  { name: "corrupted payload", encoded: "v1.not-base64!", valid: false },
  { name: "unknown version", encoded: "v2.e30", valid: false },
  { name: "unknown item", value: { schemaVersion: 1, plannerMode: "quick", optimizeMode: "least-total-levels", targetItemId: "unknown", enchantments: [{ enchantmentId: "mending", level: 1 }] }, valid: false },
] as const;
