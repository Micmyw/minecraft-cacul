import type { Metadata } from "next";
import { GuideCta } from "@/components/guide-cta";
import { GuideLinks } from "@/components/guide-links";
import { tooExpensiveGuideExample } from "@/content/guide-examples";
import { dataMetadata } from "@/data/java/26.2/metadata";
import { secondaryPageMetadata } from "@/lib/seo";

const title = "Minecraft Anvil Too Expensive – Causes and Fixes";
const description =
  "See why a Minecraft anvil says Too Expensive, how the 40-level Survival limit works, and when a better enchantment order can fix it.";
const pathname = "/minecraft-anvil-too-expensive";

export const metadata: Metadata = {
  ...secondaryPageMetadata(title, description, pathname, true),
  title: { absolute: title },
};

export default function TooExpensivePage() {
  const example = tooExpensiveGuideExample;

  return (
    <article className="guide-page page-width">
      <header className="guide-header">
        <span className="section-kicker">SURVIVAL ANVIL LIMIT</span>
        <h1>Minecraft Anvil Too Expensive</h1>
        <p className="page-lede">
          In Survival, the anvil blocks a combine when one operation reaches the
          level-cost limit. The order of books can determine whether that final step
          stays legal.
        </p>
      </header>

      <section className="guide-callout" aria-labelledby="too-expensive-short-answer">
        <h2 id="too-expensive-short-answer">Direct answer</h2>
        <p>
          Minecraft Java Edition shows Too Expensive when a single anvil operation
          costs 40 levels or more in Survival. A plan may cost far more than 40 levels
          in total and still work if every individual step remains at 39 or below.
        </p>
      </section>

      <section>
        <h2>What creates the cost?</h2>
        <div className="guide-comparison">
          <article><h3>Enchantment transfer</h3><p>Each applicable enchantment contributes a cost based on its level and whether it moves from a book or another supported input.</p></article>
          <article><h3>Prior-work penalties</h3><p>Both anvil slots contribute 2^priorWork − 1. Repeatedly applying books to the same target makes this part grow quickly.</p></article>
        </div>
        <p>
          The total levels spent across earlier legal operations do not trigger the
          message. The highest single-step cost is the value that must stay below 40.
        </p>
      </section>

      <section>
        <h2>Can Too Expensive be fixed?</h2>
        <ul className="guide-checklist">
          <li>Reorder the books so expensive transfers do not land on the most-worked item.</li>
          <li>Combine compatible books before applying the result to the target.</li>
          <li>Use inputs with lower prior-work counts when you have a choice.</li>
          <li>Compare an order problem with inputs for which every possible final step is blocked.</li>
        </ul>
        <p className="guide-warning">
          A better order can fix some inputs, but it does not guarantee that every case can be fixed.
          If every possible final merge costs 40 or more, there is no Survival-legal plan for those inputs.
        </p>
      </section>

      <section aria-labelledby="too-expensive-example">
        <span className="section-kicker">SOLVER-VERIFIED EXAMPLE</span>
        <h2 id="too-expensive-example">{example.title}</h2>
        <p>
          Applying Protection IV, Feather Falling IV, Depth Strider III, Soul Speed III,
          Thorns III, Unbreaking III, and Mending I in the listed input order ends with a
          {" "}{example.sequential.tooExpensiveStepCost}-level blocked step. The optimized
          tree remains legal because it combines compatible books first.
        </p>
        <div className="guide-metrics">
          <div><span>Optimized total</span><strong>{example.optimized.summary.totalLevels} levels</strong></div>
          <div><span>Highest optimized step</span><strong>{example.optimized.summary.highestStepCost} levels</strong></div>
          <div><span>Sequential final step</span><strong>{example.sequential.tooExpensiveStepCost} levels</strong></div>
        </div>
        <ol className="guide-steps">
          {example.optimized.steps.map((step, index) => (
            <li key={step.action}>
              <span>Step {index + 1}</span>
              <div><strong>{step.action}</strong><p>{step.cost} levels · result prior work {step.resultPriorWork}</p></div>
            </li>
          ))}
        </ol>
        <p>
          The optimized plan spends {example.optimized.summary.totalLevels} levels in
          total, which is above 40, yet its highest operation is only {example.optimized.summary.highestStepCost}.
          This is direct evidence that the warning is driven by one step, not the total plan.
        </p>
      </section>

      <section>
        <h2>Troubleshooting checklist</h2>
        <ol className="guide-checklist numbered">
          <li>Record the target&apos;s current prior-work count.</li>
          <li>Record each book&apos;s enchantments, levels, and prior work.</li>
          <li>Check that all wanted enchantments are compatible with the target and each other.</li>
          <li>Calculate a merge tree and inspect the highest single step.</li>
          <li>If no legal plan exists, replace or recreate the highest-prior-work inputs.</li>
        </ol>
      </section>

      <section>
        <h2>Too Expensive FAQ</h2>
        <div className="faq-list guide-faq">
          <details><summary>Is the limit 39 or 40 levels?</summary><p>A 39-level operation is legal in Survival. An operation at 40 or above is blocked as Too Expensive.</p></details>
          <details><summary>Does Creative mode have the same block?</summary><p>Creative mode can bypass the Survival cost block, but this guide and calculator label legality for Survival planning.</p></details>
          <details><summary>Can book order always solve the problem?</summary><p>No. Reordering helps when a legal merge tree exists. Some high-prior-work inputs leave every final merge at 40 or more.</p></details>
          <details><summary>Why is the optimized total above 40?</summary><p>The limit applies independently to each operation. Several legal steps can add up to more than 40 total levels.</p></details>
        </div>
      </section>

      <p className="guide-verification">Verified for Java Edition {dataMetadata.gameVersion} on {dataMetadata.verifiedAt}.</p>
      <GuideCta />
      <GuideLinks current="too-expensive" />
    </article>
  );
}
