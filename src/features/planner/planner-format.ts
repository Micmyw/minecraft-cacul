import type { CombineStep, Ingredient } from "@/domain/enchanting/types";
import type { CatalogSnapshot } from "@/workers/protocol";

const roman = ["", "I", "II", "III", "IV", "V"];

export function formatIngredient(
  ingredient: Ingredient,
  catalog: CatalogSnapshot,
): string {
  const base =
    ingredient.kind === "book"
      ? ingredient.enchantments.length > 1
        ? "Combined Book"
        : "Book"
      : catalog.items.find((item) => item.id === ingredient.itemId)?.name ?? "Item";
  const enchantments = ingredient.enchantments.map((enchantment) => {
    const name = catalog.enchantments.find((item) => item.id === enchantment.enchantmentId)?.name ?? enchantment.enchantmentId;
    return `${name} ${roman[enchantment.level] ?? enchantment.level}`;
  });
  return enchantments.length > 0 ? `${base} — ${enchantments.join(", ")}` : base;
}

export function formatStepsForClipboard(
  steps: readonly CombineStep[],
  catalog: CatalogSnapshot,
): string {
  return steps
    .map(
      (step, index) =>
        `Step ${index + 1}\nLeft slot: ${formatIngredient(step.left, catalog)}\nLeft prior work: ${step.left.priorWork}\nRight slot: ${formatIngredient(step.right, catalog)}\nRight prior work: ${step.right.priorWork}\nCost: ${step.levelCost} levels${step.legalInSurvival ? "" : " — Too Expensive"}\nResult: ${formatIngredient(step.result, catalog)}\nNew prior work: ${step.result.priorWork}`,
    )
    .join("\n\n");
}
