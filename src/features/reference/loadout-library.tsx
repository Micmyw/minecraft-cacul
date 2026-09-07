import { AnvilIcon, ArrowRightIcon } from "@/components/icons";
import { loadoutPresets } from "@/content/loadout-presets";
import { enchantmentById } from "@/data/java/26.2/enchantments";
import { encodePlanState } from "@/lib/share-state";

const romanLevels = ["", "I", "II", "III", "IV", "V"];

export function LoadoutLibrary() {
  return (
    <section className="loadout-library" aria-labelledby="loadout-library-title">
      <div className="reference-section-heading">
        <div>
          <span className="section-kicker">READY-MADE WORK ORDERS</span>
          <h2 id="loadout-library-title">Start from a proven build</h2>
        </div>
        <p>
          Ten Survival-legal loadouts are checked by the same exact solver as the
          calculator. Load one, change any book, then calculate your order.
        </p>
      </div>
      <div className="loadout-grid">
        {loadoutPresets.map((preset) => (
          <article className="loadout-card" key={preset.id}>
            <div className="loadout-card-topline">
              <span><AnvilIcon size={17} />{preset.itemLabel}</span>
              <span>{preset.state.enchantments.length} books</span>
            </div>
            <h3>{preset.label}</h3>
            <p>{preset.purpose}</p>
            <ul aria-label={`${preset.label} enchantments`}>
              {preset.state.enchantments.map(({ enchantmentId, level }) => (
                <li key={enchantmentId}>
                  {enchantmentById.get(enchantmentId)?.name ?? enchantmentId}{" "}
                  {romanLevels[level] ?? level}
                </li>
              ))}
            </ul>
            <a
              className="loadout-link"
              href={`/#plan=${encodePlanState(preset.state)}`}
              aria-label={`Load ${preset.label} in calculator`}
            >
              Load in calculator <ArrowRightIcon size={18} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
