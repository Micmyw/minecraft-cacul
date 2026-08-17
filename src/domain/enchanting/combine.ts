import {
  getEnchantmentDefinition,
  isEnchantmentApplicable,
} from "@/data/java/26.2/enchantments";
import { getItemDefinition } from "@/data/java/26.2/items";
import { nextPriorWork, priorWorkPenalty } from "./prior-work";
import type { EnchantmentLevel, Ingredient } from "./types";

export type CombineOutcome = {
  result: Ingredient;
  levelCost: number;
  legalInSurvival: boolean;
  warnings: string[];
};

const roman = ["", "I", "II", "III", "IV", "V"];

export function formatEnchantmentLevel(enchantment: EnchantmentLevel): string {
  const definition = getEnchantmentDefinition(enchantment.enchantmentId);
  const level = roman[enchantment.level] ?? String(enchantment.level);
  return `${definition?.name ?? enchantment.enchantmentId} ${level}`;
}

function canCombineKinds(left: Ingredient, right: Ingredient): boolean {
  if (right.kind === "target") return false;
  if (left.kind === "book") return right.kind === "book";
  if (right.kind === "book") return true;
  return left.itemId !== null && left.itemId === right.itemId;
}

export function combineIngredients(
  left: Ingredient,
  right: Ingredient,
  survivalMaxStepCost: number,
): CombineOutcome | null {
  if (!canCombineKinds(left, right)) return null;

  const merged = new Map(
    left.enchantments.map((enchantment) => [enchantment.enchantmentId, { ...enchantment }]),
  );
  const warnings: string[] = [];
  let enchantmentCost = 0;
  let applied = 0;

  for (const incoming of right.enchantments) {
    const definition = getEnchantmentDefinition(incoming.enchantmentId);
    if (!definition) return null;
    if (
      left.kind !== "book" &&
      left.itemId &&
      !isEnchantmentApplicable(incoming.enchantmentId, left.itemId)
    ) {
      const itemName = getItemDefinition(left.itemId)?.name ?? left.itemId;
      warnings.push(
        `${formatEnchantmentLevel(incoming)} was not applicable to ${itemName} and was discarded.`,
      );
      continue;
    }

    const existing = merged.get(incoming.enchantmentId);
    let resultLevel = incoming.level;
    if (existing) {
      resultLevel =
        existing.level === incoming.level
          ? Math.min(definition.maxLevel, existing.level + 1)
          : Math.max(existing.level, incoming.level);
    }
    merged.set(incoming.enchantmentId, {
      enchantmentId: incoming.enchantmentId,
      level: resultLevel,
    });
    enchantmentCost +=
      (right.kind === "book" ? definition.bookCost : definition.anvilCost) *
      resultLevel;
    applied += 1;
  }

  if (applied === 0) return null;

  const levelCost =
    priorWorkPenalty(left.priorWork) +
    priorWorkPenalty(right.priorWork) +
    enchantmentCost;
  const result: Ingredient = {
    id: `(${left.id}+${right.id})`,
    kind: left.kind,
    itemId: left.itemId,
    enchantments: [...merged.values()].sort((a, b) =>
      a.enchantmentId.localeCompare(b.enchantmentId),
    ),
    priorWork: nextPriorWork(left.priorWork, right.priorWork),
  };

  return {
    result,
    levelCost,
    legalInSurvival: levelCost <= survivalMaxStepCost,
    warnings,
  };
}
