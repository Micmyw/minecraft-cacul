import type { Ingredient } from "@/domain/enchanting/types";
import type { CatalogSnapshot } from "@/workers/protocol";
import { EnchantmentPicker } from "./enchantment-picker";

export function IngredientEditor({
  ingredient,
  targetItemId,
  catalog,
  onChange,
  onRemove,
}: {
  ingredient: Ingredient;
  targetItemId: string | null;
  catalog: CatalogSnapshot;
  onChange: (ingredient: Ingredient) => void;
  onRemove: () => void;
}) {
  const itemName = catalog.items.find((item) => item.id === targetItemId)?.name;
  return (
    <section className="ingredient-card">
      <div className="ingredient-title">
        <span>{ingredient.kind === "book" ? "Book" : "Item"}</span>
        <strong>{ingredient.kind === "book" ? "Enchanted Book" : itemName ?? "Same-type item"}</strong>
        <button type="button" className="text-button danger" onClick={onRemove}>Remove</button>
      </div>
      <label className="field-label" htmlFor={`${ingredient.id}-prior-work`}>Prior-work count</label>
      <input
        id={`${ingredient.id}-prior-work`}
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={ingredient.priorWork}
        onChange={(event) => onChange({ ...ingredient, priorWork: Math.max(0, Number(event.target.value)) })}
      />
      <EnchantmentPicker
        catalog={catalog}
        itemId={targetItemId}
        selected={ingredient.enchantments}
        onChange={(enchantments) => onChange({ ...ingredient, enchantments })}
        label={ingredient.kind === "book" ? "Enchantments on this book" : "Enchantments on this item"}
        allowAll={ingredient.kind === "book"}
      />
    </section>
  );
}
