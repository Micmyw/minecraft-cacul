import type { Ingredient, IngredientKind } from "@/domain/enchanting/types";
import type { InventoryPlanStateV1 } from "@/lib/share-state";
import type { CatalogSnapshot } from "@/workers/protocol";
import { IngredientEditor } from "./ingredient-editor";
import { TargetEditor } from "./target-editor";

function nextId(kind: IngredientKind, ingredients: Ingredient[]): string {
  let index = 1;
  while (ingredients.some((item) => item.id === `${kind}-${index}`)) index += 1;
  return `${kind}-${index}`;
}

export function InventoryPlanner({
  state,
  catalog,
  onChange,
}: {
  state: InventoryPlanStateV1;
  catalog: CatalogSnapshot;
  onChange: (state: InventoryPlanStateV1) => void;
}) {
  const updateTarget = (target: Ingredient) => {
    const sacrifices = state.sacrifices.map((ingredient) =>
      ingredient.kind === "item"
        ? {
            ...ingredient,
            itemId: target.itemId,
            enchantments: ingredient.enchantments.filter((selected) =>
              catalog.enchantments
                .find((entry) => entry.id === selected.enchantmentId)
                ?.supportedItemIds.includes(target.itemId ?? ""),
            ),
          }
        : ingredient,
    );
    onChange({ ...state, target, sacrifices });
  };
  const addIngredient = (kind: "book" | "item") => {
    if (state.sacrifices.length >= 32) return;
    const ingredient: Ingredient = {
      id: nextId(kind, state.sacrifices),
      kind,
      itemId: kind === "book" ? null : state.target.itemId,
      enchantments: [],
      priorWork: 0,
    };
    onChange({ ...state, sacrifices: [...state.sacrifices, ingredient] });
  };
  return (
    <div className="planner-form inventory-form" role="tabpanel">
      <TargetEditor target={state.target} catalog={catalog} onChange={updateTarget} />
      <div className="ingredient-list">
        {state.sacrifices.map((ingredient, index) => (
          <IngredientEditor
            key={ingredient.id}
            ingredient={ingredient}
            targetItemId={state.target.itemId}
            catalog={catalog}
            onChange={(updated) =>
              onChange({
                ...state,
                sacrifices: state.sacrifices.map((item, itemIndex) =>
                  itemIndex === index ? updated : item,
                ),
              })
            }
            onRemove={() =>
              onChange({
                ...state,
                sacrifices: state.sacrifices.filter((_, itemIndex) => itemIndex !== index),
              })
            }
          />
        ))}
      </div>
      <div className="add-ingredient-actions">
        <button type="button" onClick={() => addIngredient("book")} disabled={state.sacrifices.length >= 32}>+ Add enchanted book</button>
        <button type="button" className="secondary-button" onClick={() => addIngredient("item")} disabled={!state.target.itemId || state.sacrifices.length >= 32}>+ Add same-type item</button>
        <span>{state.sacrifices.length} / 32 materials</span>
      </div>
    </div>
  );
}
