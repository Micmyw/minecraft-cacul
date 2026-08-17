import { MAX_PRIOR_WORK, MAX_SACRIFICES } from "@/domain/enchanting/types";
import type {
  CatalogSnapshot,
  EnchantmentLevel,
  Ingredient,
  OptimizeMode,
  PlanStateV1,
  SolveRequest,
} from "@/domain/enchanting/types";

export type {
  InventoryPlanStateV1,
  PlanStateV1,
  QuickPlanStateV1,
} from "@/domain/enchanting/types";

const MAX_ENCODED_STATE_LENGTH = 48_000;

export type DecodePlanResult =
  | { ok: true; state: PlanStateV1 }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptimizeMode(value: unknown): value is OptimizeMode {
  return value === "least-total-levels" || value === "preserve-future-work";
}

function isEnchantmentLevel(value: unknown): value is EnchantmentLevel {
  return (
    isRecord(value) &&
    typeof value.enchantmentId === "string" &&
    typeof value.level === "number"
  );
}

function isIngredient(value: unknown): value is Ingredient {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    (value.kind === "target" || value.kind === "book") &&
    (typeof value.itemId === "string" || value.itemId === null) &&
    Array.isArray(value.enchantments) &&
    value.enchantments.every(isEnchantmentLevel) &&
    typeof value.priorWork === "number"
  );
}

export function parsePlanStateObject(
  value: unknown,
  requireSolvable: boolean,
  catalog?: CatalogSnapshot,
): DecodePlanResult {
  if (!isRecord(value) || value.schemaVersion !== 1) {
    return { ok: false, error: "This share link uses an unsupported plan version." };
  }
  if (!isOptimizeMode(value.optimizeMode)) {
    return { ok: false, error: "The plan has an unknown optimization mode." };
  }

  let state: PlanStateV1;
  if (value.plannerMode === "quick") {
    if (
      typeof value.targetItemId !== "string" ||
      !Array.isArray(value.enchantments) ||
      !value.enchantments.every(isEnchantmentLevel)
    ) {
      return { ok: false, error: "The Quick Plan state is malformed." };
    }
    state = {
      schemaVersion: 1,
      plannerMode: "quick",
      optimizeMode: value.optimizeMode,
      targetItemId: value.targetItemId,
      enchantments: value.enchantments,
    };
  } else if (value.plannerMode === "inventory") {
    if (
      !isIngredient(value.target) ||
      !Array.isArray(value.sacrifices) ||
      !value.sacrifices.every(isIngredient)
    ) {
      return { ok: false, error: "The Inventory Plan state is malformed." };
    }
    state = {
      schemaVersion: 1,
      plannerMode: "inventory",
      optimizeMode: value.optimizeMode,
      target: value.target,
      sacrifices: value.sacrifices,
    };
  } else {
    return { ok: false, error: "The plan has an unknown planner mode." };
  }

  if (!catalog) return { ok: true, state };

  const itemId =
    state.plannerMode === "quick" ? state.targetItemId : state.target.itemId;
  const catalogItemId = itemId ?? "";
  if (
    (requireSolvable && !itemId) ||
    (itemId && !catalog.items.some((item) => item.id === itemId))
  ) {
    return { ok: false, error: `Unknown item "${itemId ?? ""}".` };
  }
  const allEnchantments =
    state.plannerMode === "quick"
      ? state.enchantments
      : [state.target, ...state.sacrifices].flatMap(
          (ingredient) => ingredient.enchantments,
        );
  const targetEnchantmentIds =
    state.plannerMode === "inventory"
      ? state.target.enchantments.map((enchantment) => enchantment.enchantmentId)
      : [];
  for (const enchantment of allEnchantments) {
    const definition = catalog.enchantments.find(
      (item) => item.id === enchantment.enchantmentId,
    );
    if (!definition) {
      return {
        ok: false,
        error: `Unknown enchantment "${enchantment.enchantmentId}".`,
      };
    }
    if (
      !Number.isSafeInteger(enchantment.level) ||
      enchantment.level < 1 ||
      enchantment.level > definition.maxLevel
    ) {
      return {
        ok: false,
        error: `${definition.name} supports levels 1–${definition.maxLevel}.`,
      };
    }
  }
  if (state.plannerMode === "quick") {
    if (requireSolvable && state.enchantments.length === 0) {
      return { ok: false, error: "Add at least one enchantment." };
    }
    if (
      new Set(state.enchantments.map((item) => item.enchantmentId)).size !==
      state.enchantments.length
    ) {
      return {
        ok: false,
        error: "Each Quick Plan enchantment can appear only once.",
      };
    }
    for (const enchantment of state.enchantments) {
      const definition = catalog.enchantments.find(
        (item) => item.id === enchantment.enchantmentId,
      )!;
      if (state.targetItemId && !definition.supportedItemIds.includes(state.targetItemId)) {
        return {
          ok: false,
          error: `${definition.name} cannot be applied to the selected item.`,
        };
      }
    }
  } else {
    if (state.target.kind !== "target") {
      return { ok: false, error: "Select exactly one target item." };
    }
    if (requireSolvable && state.sacrifices.length === 0) {
      return {
        ok: false,
        error: "Add at least one enchanted book.",
      };
    }
    if (state.sacrifices.length > MAX_SACRIFICES) {
      return {
        ok: false,
        error: `A plan can contain at most ${MAX_SACRIFICES} sacrifices.`,
      };
    }
    const ids = [state.target, ...state.sacrifices].map((item) => item.id);
    if (ids.some((id) => id.length === 0) || new Set(ids).size !== ids.length) {
      return { ok: false, error: "Each ingredient must have a unique id." };
    }
    for (const ingredient of [state.target, ...state.sacrifices]) {
      if (
        !Number.isSafeInteger(ingredient.priorWork) ||
        ingredient.priorWork < 0 ||
        ingredient.priorWork > MAX_PRIOR_WORK
      ) {
        return {
          ok: false,
          error: `${ingredient.id} prior work must be a safe integer between 0 and ${MAX_PRIOR_WORK}.`,
        };
      }
      if (ingredient !== state.target && ingredient.kind !== "book") {
        return { ok: false, error: "Every sacrifice must be an enchanted book." };
      }
      if (ingredient.kind === "book" && ingredient.itemId !== null) {
        return { ok: false, error: `Book ${ingredient.id} cannot have an item type.` };
      }
      if (
        requireSolvable &&
        ingredient !== state.target &&
        ingredient.enchantments.length === 0
      ) {
        return {
          ok: false,
          error: `${ingredient.id} must contain at least one enchantment.`,
        };
      }
      const enchantmentIds = ingredient.enchantments.map(
        (enchantment) => enchantment.enchantmentId,
      );
      if (new Set(enchantmentIds).size !== enchantmentIds.length) {
        return {
          ok: false,
          error: `${ingredient.id} contains a duplicate enchantment.`,
        };
      }
      const applicable = ingredient.enchantments.filter((enchantment) => {
        const definition = catalog.enchantments.find(
          (entry) => entry.id === enchantment.enchantmentId,
        );
        return (
          definition?.supportedItemIds.includes(catalogItemId) &&
          (ingredient.kind === "target" ||
            targetEnchantmentIds.every(
              (targetId) => !definition.incompatibleWith.includes(targetId),
            ))
        );
      });
      if (
        requireSolvable &&
        ingredient.kind === "book" &&
        applicable.length === 0
      ) {
        return {
          ok: false,
          error: `Book ${ingredient.id} has no enchantment that can apply to the selected item.`,
        };
      }
      if (ingredient.kind === "target" && applicable.length !== ingredient.enchantments.length) {
        return {
          ok: false,
          error: `${ingredient.id} contains an enchantment that cannot apply to the selected item.`,
        };
      }
    }
  }

  if (!requireSolvable) return { ok: true, state };

  const applicableIds = new Set(
    allEnchantments
      .filter((enchantment) =>
        (() => {
          const definition = catalog.enchantments.find(
            (entry) => entry.id === enchantment.enchantmentId,
          );
          return (
            definition?.supportedItemIds.includes(catalogItemId) &&
            (targetEnchantmentIds.includes(enchantment.enchantmentId) ||
              targetEnchantmentIds.every(
                (targetId) => !definition.incompatibleWith.includes(targetId),
              ))
          );
        })(),
      )
      .map((enchantment) => enchantment.enchantmentId),
  );
  for (const enchantmentId of [...applicableIds].sort()) {
    const definition = catalog.enchantments.find(
      (item) => item.id === enchantmentId,
    )!;
    for (const incompatibleId of definition.incompatibleWith) {
      if (!applicableIds.has(incompatibleId) || enchantmentId > incompatibleId) {
        continue;
      }
      const incompatible = catalog.enchantments.find(
        (item) => item.id === incompatibleId,
      );
      return {
        ok: false,
        error: `${definition.name} and ${incompatible?.name ?? incompatibleId} cannot be used together.`,
      };
    }
  }
  return { ok: true, state };
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function encodePlanState(state: PlanStateV1): string {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  const encoded = `v1.${bytesToBase64Url(bytes)}`;
  if (encoded.length > MAX_ENCODED_STATE_LENGTH) {
    throw new Error("This plan is too large to share in a URL.");
  }
  return encoded;
}

export function decodePlanState(
  encoded: string,
  catalog?: CatalogSnapshot,
): DecodePlanResult {
  if (!encoded.startsWith("v1.")) {
    return { ok: false, error: "This is not a versioned AnvilPilot plan." };
  }
  if (encoded.length > MAX_ENCODED_STATE_LENGTH) {
    return { ok: false, error: "This shared plan is too large." };
  }
  try {
    const json = new TextDecoder("utf-8", { fatal: true }).decode(
      base64UrlToBytes(encoded.slice(3)),
    );
    return parsePlanStateObject(JSON.parse(json), true, catalog);
  } catch {
    return { ok: false, error: "This shared plan is damaged or incomplete." };
  }
}

export function planStateToSolveRequest(state: PlanStateV1): SolveRequest {
  if (state.plannerMode === "inventory") {
    return {
      edition: "java",
      gameVersion: "26.2",
      target: state.target,
      sacrifices: state.sacrifices,
      optimizeMode: state.optimizeMode,
      survivalMaxStepCost: 39,
    };
  }
  return {
    edition: "java",
    gameVersion: "26.2",
    target: {
      id: "target",
      kind: "target",
      itemId: state.targetItemId,
      enchantments: [],
      priorWork: 0,
    },
    sacrifices: state.enchantments.map((enchantment) => ({
      id: `quick-book-${enchantment.enchantmentId}`,
      kind: "book",
      itemId: null,
      enchantments: [{ ...enchantment }],
      priorWork: 0,
    })),
    optimizeMode: state.optimizeMode,
    survivalMaxStepCost: 39,
  };
}
