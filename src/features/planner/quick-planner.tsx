import { SparkIcon } from "@/components/icons";
import type { QuickPlanStateV1 } from "@/lib/share-state";
import type { CatalogSnapshot } from "@/workers/protocol";
import { EnchantmentPicker } from "./enchantment-picker";
import { ExamplePlanButtons } from "./example-plan-buttons";
import type { ExamplePlan } from "./example-plans";

export function QuickPlanner({
  state,
  catalog,
  onChange,
  onLoadExample,
}: {
  state: QuickPlanStateV1;
  catalog: CatalogSnapshot;
  onChange: (state: QuickPlanStateV1) => void;
  onLoadExample: (example: ExamplePlan) => void;
}) {
  return (
    <div
      id="planner-panel-quick"
      className="planner-form"
      role="tabpanel"
      aria-labelledby="planner-tab-quick"
    >
      <div className="mode-intro quick-mode-intro">
        <span className="mode-glyph" aria-hidden="true"><SparkIcon size={23} /></span>
        <div><strong>Fresh-book workflow</strong><p>Choose an item and target enchantments. Fresh, single-enchantment books are assumed.</p></div>
      </div>
      <ExamplePlanButtons onLoad={onLoadExample} />
      <div className="form-section">
        <div className="section-heading">
          <span>01</span>
          <div><h3>Select item</h3><p>Materials with the same enchantment rules are grouped together.</p></div>
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
          <div><h3>Choose target enchantments</h3><p>Quick Plan assumes one fresh book per enchantment.</p></div>
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
