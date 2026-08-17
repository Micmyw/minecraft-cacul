import type { QuickPlanStateV1 } from "@/lib/share-state";
import type { CatalogSnapshot } from "@/workers/protocol";
import { EnchantmentPicker } from "./enchantment-picker";

export function QuickPlanner({
  state,
  catalog,
  onChange,
}: {
  state: QuickPlanStateV1;
  catalog: CatalogSnapshot;
  onChange: (state: QuickPlanStateV1) => void;
}) {
  return (
    <div className="planner-form" role="tabpanel">
      <div className="form-section">
        <div className="section-heading">
          <span>01</span>
          <div><h3>Choose the target item</h3><p>Materials with the same enchantment rules are grouped together.</p></div>
        </div>
        <label className="field-label" htmlFor="quick-target">Target item</label>
        <select
          id="quick-target"
          value={state.targetItemId}
          onChange={(event) => {
            const targetItemId = event.target.value;
            const enchantments = state.enchantments.filter((selected) =>
              catalog.enchantments
                .find((entry) => entry.id === selected.enchantmentId)
                ?.supportedItemIds.includes(targetItemId),
            );
            onChange({ ...state, targetItemId, enchantments });
          }}
        >
          <option value="">Choose an item</option>
          {catalog.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <div className="form-section">
        <div className="section-heading">
          <span>02</span>
          <div><h3>Add wanted enchantments</h3><p>Quick Plan assumes one fresh book per enchantment.</p></div>
        </div>
        <EnchantmentPicker
          catalog={catalog}
          itemId={state.targetItemId || null}
          selected={state.enchantments}
          onChange={(enchantments) => onChange({ ...state, enchantments })}
          label="Wanted enchantments"
        />
      </div>
    </div>
  );
}
