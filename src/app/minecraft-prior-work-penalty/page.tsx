import type { Metadata } from "next";
import { GuideCta } from "@/components/guide-cta";
import { GuideLinks } from "@/components/guide-links";
import { priorWorkGuideExample } from "@/content/guide-examples";
import { dataMetadata } from "@/data/java/26.2/metadata";
import { priorWorkPenalty } from "@/domain/enchanting/prior-work";
import { secondaryPageMetadata } from "@/lib/seo";

const title = "Minecraft Prior Work Penalty – Anvil Cost Table";
const description =
  "Learn how Minecraft Java Edition prior work increases anvil costs, use the 2^n − 1 penalty table, and plan a cheaper enchantment order.";
const pathname = "/minecraft-prior-work-penalty";

export const metadata: Metadata = {
  ...secondaryPageMetadata(title, description, pathname, true),
  title: { absolute: title },
};

const penaltyRows = Array.from({ length: 7 }, (_, priorWork) => ({
  priorWork,
  penalty: priorWorkPenalty(priorWork),
}));

export default function PriorWorkPenaltyPage() {
  const example = priorWorkGuideExample;

  return (
    <article className="guide-page page-width">
      <header className="guide-header">
        <span className="section-kicker">JAVA ANVIL MECHANICS</span>
        <h1>Minecraft Prior Work Penalty</h1>
        <p className="page-lede">
          Prior work records how many generations of anvil operations an item or book
          has passed through. The count, not the number of enchantments, controls the
          extra penalty added to the next operation.
        </p>
      </header>

      <section className="guide-callout" aria-labelledby="prior-work-short-answer">
        <h2 id="prior-work-short-answer">Short answer</h2>
        <p>
          Minecraft Java Edition adds an exponentially growing prior-work penalty for
          both anvil slots. Fresh inputs start at zero; every combined result receives
          a new prior-work count.
        </p>
        <code>penalty = 2^priorWork − 1</code>
      </section>

      <section>
        <h2>Prior-work penalty table</h2>
        <p>
          The table is generated from the same domain function used by AnvilPilot. A
          prior-work count of five already adds 31 penalty levels before the transferred
          enchantments are considered.
        </p>
        <div className="guide-table-scroll">
          <table aria-label="Prior-work penalty values">
            <thead><tr><th scope="col">Prior work</th><th scope="col">Penalty</th></tr></thead>
            <tbody>
              {penaltyRows.map((row) => (
                <tr key={row.priorWork}><td>{row.priorWork}</td><td>{row.penalty}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          This penalty contributes to one step&apos;s cost. Survival does not limit the
          total levels across a complete plan; it blocks a single anvil operation when
          that step reaches 40 levels or more.
        </p>
      </section>

      <section>
        <h2>How combined items get their next count</h2>
        <p>
          The result takes the larger history from the two inputs and advances it by
          one generation:
        </p>
        <div className="guide-formula">newPriorWork = max(leftPriorWork, rightPriorWork) + 1</div>
        <p>
          Combining two fresh books produces prior work 1. Combining a prior-work 1
          item with a prior-work 0 book produces prior work 2. This is why balanced
          book groups can keep the target&apos;s history lower than applying every book
          directly to it.
        </p>
      </section>

      <section aria-labelledby="prior-work-example">
        <span className="section-kicker">SOLVER-VERIFIED EXAMPLE</span>
        <h2 id="prior-work-example">{example.title}</h2>
        <p>
          The inputs are Efficiency V, Fortune III, Unbreaking III, and Mending I on
          fresh books. The optimized work order costs {example.optimized.summary.totalLevels} levels;
          applying the same books sequentially costs {example.sequential.totalLevels} levels.
        </p>
        <ol className="guide-steps">
          {example.optimized.steps.map((step, index) => (
            <li key={step.action}>
              <span>Step {index + 1}</span>
              <div><strong>{step.action}</strong><p>{step.cost} levels · prior work {step.leftPriorWork} + {step.rightPriorWork} → {step.resultPriorWork}</p></div>
            </li>
          ))}
        </ol>
        <div className="guide-metrics">
          <div><span>Optimized total</span><strong>{example.optimized.summary.totalLevels} levels</strong></div>
          <div><span>Sequential total</span><strong>{example.sequential.totalLevels} levels</strong></div>
          <div><span>Highest optimized step</span><strong>{example.optimized.summary.highestStepCost} levels</strong></div>
        </div>
        <p>
          The second step combines books before they touch the pickaxe. That small tree
          saves four total levels and keeps every individual operation comfortably
          below the Survival limit.
        </p>
      </section>

      <section>
        <h2>Least total levels vs Preserve future work</h2>
        <div className="guide-comparison">
          <article><h3>Least total levels</h3><p>Ranks legal plans by the sum of every displayed anvil cost. Use it when the current build is the main priority.</p></article>
          <article><h3>Preserve future work</h3><p>Ranks legal plans by the final item&apos;s prior work first, then uses total levels and stable tie-breakers. Use it when another future anvil operation matters.</p></article>
        </div>
      </section>

      <section>
        <h2>Common mistakes</h2>
        <ul className="guide-checklist">
          <li>Treating prior work as the number of enchantments on the item.</li>
          <li>Adding only the target&apos;s penalty and forgetting the right-slot input.</li>
          <li>Assuming the cheapest total always leaves the lowest final prior work.</li>
          <li>Checking total plan levels instead of the highest single-step cost.</li>
        </ul>
      </section>

      <section>
        <h2>Prior work FAQ</h2>
        <div className="faq-list guide-faq">
          <details><summary>Does a grindstone reset prior work?</summary><p>A grindstone removes most enchantments but does not erase an item&apos;s prior-work history. Enter the count the item actually carries.</p></details>
          <details><summary>Does combining two fresh books create prior work?</summary><p>Yes. Both inputs start at zero, and the result becomes max(0, 0) + 1, so the combined book has prior work 1.</p></details>
          <details><summary>Why combine books before the target?</summary><p>A balanced book tree can transfer several enchantments while increasing the target through fewer prior-work generations.</p></details>
          <details><summary>Is a high prior-work item always impossible?</summary><p>No. The enchantment transfer cost and both input penalties determine the step. It becomes blocked in Survival only when a single operation reaches 40 or more.</p></details>
        </div>
      </section>

      <p className="guide-verification">Verified for Java Edition {dataMetadata.gameVersion} on {dataMetadata.verifiedAt}.</p>
      <GuideCta />
      <GuideLinks current="prior-work" />
    </article>
  );
}
