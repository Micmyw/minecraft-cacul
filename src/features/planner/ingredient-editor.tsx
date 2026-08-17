import { MAX_PRIOR_WORK, type Ingredient } from "@/domain/enchanting/types";
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
  return (
    <section className="ingredient-card">
      <div className="ingredient-title">
        <span>Book</span>
        <strong>Enchanted Book</strong>
        <button type="button" className="text-button danger" onClick={onRemove}>Remove</button>
      </div>
      <label className="field-label" htmlFor={`${ingredient.id}-prior-work`}>Prior-work count</label>
      <input
        id={`${ingredient.id}-prior-work`}
        type="number"
        inputMode="numeric"
        min={0}
        max={MAX_PRIOR_WORK}
        step={1}
        value={ingredient.priorWork}
        onChange={(event) => onChange({
          ...ingredient,
          priorWork: Math.min(
            MAX_PRIOR_WORK,
            Math.max(0, Math.trunc(Number(event.target.value) || 0)),
          ),
        })}
      />
      <EnchantmentPicker
        catalog={catalog}
        itemId={targetItemId}
        selected={ingredient.enchantments}
        onChange={(enchantments) => onChange({ ...ingredient, enchantments })}
        label="Enchantments on this book"
        allowAll
      />
    </section>
  );
}
