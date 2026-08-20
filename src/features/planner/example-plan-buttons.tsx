import { useId } from "react";
import { examplePlans, type ExamplePlan } from "./example-plans";

export function ExamplePlanButtons({
  onLoad,
}: {
  onLoad: (example: ExamplePlan) => void;
}) {
  const headingId = useId();

  return (
    <section className="example-plans" aria-labelledby={headingId}>
      <div className="example-plans-heading">
        <h3 id={headingId}>Try an example</h3>
        <p>Load a complete legal setup, then edit it.</p>
      </div>
      <div className="example-plan-grid">
        {examplePlans.map((example) => {
          const descriptionId = `${headingId}-${example.id}`;
          return (
            <button
              key={example.id}
              type="button"
              className="example-plan-button"
              aria-label={example.label}
              aria-describedby={descriptionId}
              onClick={() => onLoad(example)}
            >
              <strong>{example.label}</strong>
              <span id={descriptionId}>{example.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
