import type { Ingredient } from "@/domain/enchanting/types";
import type { CatalogSnapshot } from "@/workers/protocol";
import { EnchantmentPicker } from "./enchantment-picker";

export function TargetEditor({
  target,
  catalog,
  onChange,
}: {
  target: Ingredient;
  catalog: CatalogSnapshot;
  onChange: (target: Ingredient) => void;
}) {
  return (
    <section className="ingredient-card target-card">
      <div className="ingredient-title"><span>Target</span><strong>The item you keep</strong></div>
      <label className="field-label" htmlFor="inventory-target">Target item</label>
      <select
        id="inventory-target"
        value={target.itemId ?? ""}
        onChange={(event) => {
          const itemId = event.target.value;
          onChange({
            ...target,
            itemId,
            enchantments: target.enchantments.filter((selected) =>
              catalog.enchantments
                .find((entry) => entry.id === selected.enchantmentId)
                ?.supportedItemIds.includes(itemId),
            ),
          });
        }}
      >
        <option value="">Choose an item</option>
        {catalog.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <label className="field-label" htmlFor="target-prior-work">Prior-work count</label>
      <input
        id="target-prior-work"
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={target.priorWork}
        onChange={(event) => onChange({ ...target, priorWork: Math.max(0, Number(event.target.value)) })}
      />
      <EnchantmentPicker
        catalog={catalog}
        itemId={target.itemId}
        selected={target.enchantments}
        onChange={(enchantments) => onChange({ ...target, enchantments })}
        label="Enchantments already on the target"
      />
    </section>
  );
}
