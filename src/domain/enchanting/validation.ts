import {
  getEnchantmentDefinition,
  isEnchantmentApplicable,
} from "@/data/java/26.2/enchantments";
import { getItemDefinition } from "@/data/java/26.2/items";
import { findCompatibilityConflicts } from "./compatibility";
import { MAX_SACRIFICES, type Ingredient, type SolveRequest } from "./types";

function validateIngredient(
  ingredient: Ingredient,
  targetItemId: string,
  errors: string[],
): void {
  if (!ingredient.id) errors.push("Each ingredient must have an id.");
  if (!Number.isInteger(ingredient.priorWork) || ingredient.priorWork < 0) {
    errors.push(`${ingredient.id || "Ingredient"} prior work must be 0 or a positive integer.`);
  }
  if (ingredient.kind === "book") {
    if (ingredient.itemId !== null) {
      errors.push(`Book ${ingredient.id} cannot have an item type.`);
    }
  } else if (!ingredient.itemId || !getItemDefinition(ingredient.itemId)) {
    errors.push(`Unknown item "${ingredient.itemId ?? ""}".`);
  }
  if (ingredient.kind === "item" && ingredient.itemId !== targetItemId) {
    errors.push(`Item ${ingredient.id} must be the same type as the target.`);
  }
  if (ingredient.kind !== "target" && ingredient.enchantments.length === 0) {
    errors.push(`${ingredient.id} must contain at least one enchantment.`);
  }

  const seen = new Set<string>();
  let usableOnTarget = false;
  for (const enchantment of ingredient.enchantments) {
    const definition = getEnchantmentDefinition(enchantment.enchantmentId);
    if (!definition) {
      errors.push(`Unknown enchantment "${enchantment.enchantmentId}".`);
      continue;
    }
    if (seen.has(enchantment.enchantmentId)) {
      errors.push(`${definition.name} appears more than once in ${ingredient.id}.`);
    }
    seen.add(enchantment.enchantmentId);
    if (
      !Number.isInteger(enchantment.level) ||
      enchantment.level < 1 ||
      enchantment.level > definition.maxLevel
    ) {
      errors.push(`${definition.name} supports levels 1–${definition.maxLevel}.`);
    }
    const applicable = isEnchantmentApplicable(enchantment.enchantmentId, targetItemId);
    usableOnTarget ||= applicable;
    if (ingredient.kind !== "book" && !applicable) {
      const itemName = getItemDefinition(ingredient.itemId)?.name ?? ingredient.itemId;
      errors.push(`${definition.name} cannot be applied to ${itemName}.`);
    }
  }
  if (ingredient.kind === "book" && ingredient.enchantments.length > 0 && !usableOnTarget) {
    const targetName = getItemDefinition(targetItemId)?.name ?? targetItemId;
    errors.push(`Book ${ingredient.id} has no enchantment that can apply to ${targetName}.`);
  }
}

export function validateSolveRequest(request: SolveRequest): string[] {
  const errors: string[] = [];
  if (request.edition !== "java" || request.gameVersion !== "26.2") {
    errors.push("Only Minecraft Java Edition 26.2 is supported.");
  }
  if (!request.target || request.target.kind !== "target") {
    errors.push("Select exactly one target item.");
    return errors;
  }
  if (!request.target.itemId || !getItemDefinition(request.target.itemId)) {
    errors.push("Select a supported target item.");
    return errors;
  }
  if (request.sacrifices.length === 0) {
    errors.push("Add at least one enchanted book or same-type item.");
  }
  if (request.sacrifices.length > MAX_SACRIFICES) {
    errors.push(`A plan can contain at most ${MAX_SACRIFICES} sacrifices.`);
  }

  const ingredients = [request.target, ...request.sacrifices];
  if (new Set(ingredients.map((ingredient) => ingredient.id)).size !== ingredients.length) {
    errors.push("Each ingredient must have a unique id.");
  }
  validateIngredient(request.target, request.target.itemId, errors);
  for (const sacrifice of request.sacrifices) {
    validateIngredient(sacrifice, request.target.itemId, errors);
  }

  const conflicts = findCompatibilityConflicts(
    ingredients.flatMap((ingredient) =>
      ingredient.enchantments
        .filter((enchantment) =>
          isEnchantmentApplicable(enchantment.enchantmentId, request.target.itemId!),
        )
        .map((enchantment) => enchantment.enchantmentId),
    ),
  );
  for (const [leftId, rightId] of conflicts) {
    const left = getEnchantmentDefinition(leftId)?.name ?? leftId;
    const right = getEnchantmentDefinition(rightId)?.name ?? rightId;
    errors.push(`${left} and ${right} cannot be used together.`);
  }
  return [...new Set(errors)];
}
