import type { Ingredient } from "@/domain/enchanting/types";
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
