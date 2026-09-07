import { useEffect, useRef, useState } from "react";
import type { Ingredient, InventorySacrificeKind } from "@/domain/enchanting/types";
import type { InventoryPlanStateV1 } from "@/lib/share-state";
import type { CatalogSnapshot } from "@/workers/protocol";
import { IngredientEditor } from "./ingredient-editor";
import { TargetEditor } from "./target-editor";

function nextId(kind: InventorySacrificeKind, ingredients: Ingredient[]): string {
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
  const pendingFocusIdRef = useRef<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const ingredientId = pendingFocusIdRef.current;
    if (!ingredientId) return;
    document.getElementById(`${ingredientId}-prior-work`)?.focus();
    pendingFocusIdRef.current = null;
  }, [state.sacrifices]);

  const updateTarget = (target: Ingredient) => {
    onChange({ ...state, target });
  };
  const addIngredient = (kind: InventorySacrificeKind) => {
    if (state.sacrifices.length >= 32) return;
    const ingredient: Ingredient = {
      id: nextId(kind, state.sacrifices),
      kind,
      itemId: null,
      enchantments: [],
      priorWork: 0,
    };
    pendingFocusIdRef.current = ingredient.id;
    setAnnouncement(`Book ${state.sacrifices.length + 1} added. Prior-work count focused.`);
    onChange({ ...state, sacrifices: [...state.sacrifices, ingredient] });
  };
  const targetReady = Boolean(state.target.itemId);
  const hasMaterials = state.sacrifices.length > 0;
  const materialsReady = hasMaterials && state.sacrifices.every(
    (ingredient) => ingredient.enchantments.length > 0,
  );
  const activeStage = !targetReady ? 1 : !hasMaterials ? 2 : !materialsReady ? 3 : 5;
  const stages = [
    "Target gear",
    "Materials",
    "Books",
    "Prior work",
    "Goal",
    "Review",
  ];
  return (
    <div
      id="planner-panel-inventory"
      className="planner-form inventory-form"
      role="tabpanel"
      aria-labelledby="planner-tab-inventory"
    >
      <div className="mode-intro inventory-mode-intro">
        <span className="mode-glyph" aria-hidden="true">◇</span>
        <div><strong>Use your real inventory</strong><p>Enter the gear and books you already own, including mixed enchantments and prior work.</p></div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      <ol className="inventory-stage-strip" aria-label="Inventory Plan workflow">
        {stages.map((label, index) => {
          const stage = index + 1;
          const isCurrent = stage === activeStage;
          const isComplete = stage < activeStage;
          return (
            <li
              className={isCurrent ? "is-active" : isComplete ? "is-complete" : undefined}
              aria-current={isCurrent ? "step" : undefined}
              key={label}
            >
              <span className="stage-number" aria-hidden="true">{String(stage).padStart(2, "0")}</span>
              <span className="stage-label">{label}</span>
              <span className="sr-only">{isCurrent ? " — current step" : isComplete ? " — complete" : " — upcoming"}</span>
            </li>
          );
        })}
      </ol>
      <div className="inventory-stage-heading"><span>01</span><div><h3>Target gear</h3><p>Describe the item you are keeping.</p></div></div>
      <TargetEditor target={state.target} catalog={catalog} onChange={updateTarget} />
      {targetReady ? (
        <>
          <div className="inventory-stage-heading materials-heading"><span>02–04</span><div><h3>Available materials</h3><p>Add the enchanted books you own, then record mixed enchantments and prior work on each one.</p></div></div>
          <p className="field-hint" role="note">
            Sacrifice books must be mutually compatible unless the target item already
            determines which conflicting enchantment is kept.
          </p>
          <div className="ingredient-list">
            {state.sacrifices.map((ingredient, index) => (
              <IngredientEditor
                key={ingredient.id}
                ingredient={ingredient}
                targetItemId={state.target.itemId}
                catalog={catalog}
                position={index + 1}
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
            <span>{state.sacrifices.length} / 32 materials</span>
          </div>
        </>
      ) : (
        <p className="inventory-next-step" role="status">
          Finish the target gear above to unlock your materials.
        </p>
      )}
    </div>
  );
}
