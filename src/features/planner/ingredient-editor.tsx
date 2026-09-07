import { useId, useState } from "react";
import { EditIcon, EnchantedBookIcon, ExpandIcon, RemoveIcon } from "@/components/icons";
import { MAX_PRIOR_WORK, type Ingredient } from "@/domain/enchanting/types";
import { priorWorkPenalty } from "@/domain/enchanting/prior-work";
import type { CatalogSnapshot } from "@/workers/protocol";
import { EnchantmentPicker } from "./enchantment-picker";

export function IngredientEditor({
  ingredient,
  targetItemId,
  catalog,
  onChange,
  onRemove,
  position,
}: {
  ingredient: Ingredient;
  targetItemId: string | null;
  catalog: CatalogSnapshot;
  onChange: (ingredient: Ingredient) => void;
  onRemove: () => void;
  position: number;
}) {
  const editorId = useId();
  const [collapsed, setCollapsed] = useState(false);
  const label = `Book ${position}`;
  const enchantmentCount = ingredient.enchantments.length;

  return (
    <section className={`ingredient-card${collapsed ? " is-collapsed" : ""}`}>
      <div className="ingredient-title">
        <span className="ingredient-item-icon" aria-hidden="true"><EnchantedBookIcon size={27} /></span>
        <div className="ingredient-title-copy">
          <strong>{label} · Enchanted Book</strong>
          <small>
            {enchantmentCount} {enchantmentCount === 1 ? "enchantment" : "enchantments"}
            {" · "}prior work {ingredient.priorWork}
          </small>
        </div>
        <button
          type="button"
          className="ingredient-toggle"
          aria-expanded={!collapsed}
          aria-controls={`${editorId}-details`}
          aria-label={`${collapsed ? "Edit" : "Collapse"} ${label} details`}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? <EditIcon size={16} /> : <ExpandIcon size={16} />}
          {collapsed ? "Edit" : "Collapse"}
        </button>
        <button
          type="button"
          className="text-button danger"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
        >
          <RemoveIcon size={16} />
          Remove
        </button>
      </div>
      <div id={`${editorId}-details`} className="ingredient-editor-body" hidden={collapsed}>
        <label className="field-label" htmlFor={`${ingredient.id}-prior-work`}>
          <span className="sr-only">{label} </span>Prior-work count
        </label>
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
        <p className="prior-work-preview" role="note">
          Adds {priorWorkPenalty(ingredient.priorWork)} penalty levels to the next anvil operation.
        </p>
        <EnchantmentPicker
          catalog={catalog}
          itemId={targetItemId}
          selected={ingredient.enchantments}
          onChange={(enchantments) => onChange({ ...ingredient, enchantments })}
          label={`${label} enchantments`}
          allowAll
        />
      </div>
    </section>
  );
}
