"use client";

import { useMemo, useState } from "react";
import { enchantments } from "@/data/java/26.2/enchantments";
import { items } from "@/data/java/26.2/items";

const romanLevels = ["", "I", "II", "III", "IV", "V"];

type AvailabilityFilter = "all" | "table" | "treasure" | "tradeable" | "curse";

export function EnchantmentExplorer() {
  const [query, setQuery] = useState("");
  const [itemId, setItemId] = useState("");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [conflictsOnly, setConflictsOnly] = useState(false);
  const normalizedQuery = query.trim().toLocaleLowerCase("en");
  const itemNames = useMemo(
    () => new Map<string, string>(items.map((item) => [item.id, item.name])),
    [],
  );
  const enchantmentNames = useMemo(
    () =>
      new Map<string, string>(
        enchantments.map((enchantment) => [enchantment.id, enchantment.name]),
      ),
    [],
  );

  const filtered = useMemo(
    () =>
      enchantments.filter((enchantment) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          enchantment.name.toLocaleLowerCase("en").includes(normalizedQuery) ||
          enchantment.id.replaceAll("_", " ").includes(normalizedQuery);
        const matchesItem =
          itemId.length === 0 || enchantment.supportedItemIds.includes(itemId);
        const matchesAvailability =
          availability === "all" ||
          (availability === "table" && enchantment.inEnchantingTable) ||
          (availability === "treasure" && enchantment.treasure) ||
          (availability === "tradeable" && enchantment.tradeable) ||
          (availability === "curse" && enchantment.curse);
        return (
          matchesQuery &&
          matchesItem &&
          matchesAvailability &&
          (!conflictsOnly || enchantment.incompatibleWith.length > 0)
        );
      }),
    [availability, conflictsOnly, itemId, normalizedQuery],
  );

  const hasFilters =
    query.length > 0 || itemId.length > 0 || availability !== "all" || conflictsOnly;
  const clearFilters = () => {
    setQuery("");
    setItemId("");
    setAvailability("all");
    setConflictsOnly(false);
  };

  return (
    <section className="enchantment-explorer" aria-labelledby="enchantment-ledger-title">
      <div className="reference-section-heading">
        <div>
          <span className="section-kicker">LIVE CATALOG LEDGER</span>
          <h2 id="enchantment-ledger-title">Find the right enchantment</h2>
        </div>
        <p>
          Filter the complete Java 26.2 catalog. Cost values below are the anvil
          multiplier used when an enchanted book transfers at its resulting level.
        </p>
      </div>

      <div className="reference-filter-panel">
        <div className="reference-filter-field">
          <label htmlFor="reference-search">Search enchantments</label>
          <input
            id="reference-search"
            type="search"
            value={query}
            placeholder="Try Mending or protection"
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="reference-filter-field">
          <label htmlFor="reference-item">Filter by item</label>
          <select
            id="reference-item"
            value={itemId}
            onChange={(event) => setItemId(event.target.value)}
          >
            <option value="">All item groups</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="reference-filter-field">
          <label htmlFor="reference-availability">Filter by availability</label>
          <select
            id="reference-availability"
            value={availability}
            onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)}
          >
            <option value="all">All availability</option>
            <option value="table">Enchanting table</option>
            <option value="treasure">Treasure only</option>
            <option value="tradeable">In tradeable tag</option>
            <option value="curse">Curses</option>
          </select>
        </div>
        <label className="reference-check">
          <input
            type="checkbox"
            checked={conflictsOnly}
            onChange={(event) => setConflictsOnly(event.target.checked)}
          />
          <span>Has conflicts only</span>
        </label>
        <button
          type="button"
          className="secondary-button reference-clear"
          disabled={!hasFilters}
          onClick={clearFilters}
        >
          Clear filters
        </button>
      </div>

      <div className="reference-count-row">
        <p role="status" aria-live="polite">
          Showing {filtered.length} of {enchantments.length} enchantments
        </p>
        <p>Higher weight means more likely during random enchanting.</p>
      </div>

      {filtered.length > 0 ? (
        <div className="enchantment-ledger" data-testid="enchantment-ledger">
          {filtered.map((enchantment) => (
            <article
              className="enchantment-entry"
              id={enchantment.id}
              key={enchantment.id}
            >
              <header>
                <div>
                  <span className="entry-id">{enchantment.id.replaceAll("_", " ")}</span>
                  <h3>{enchantment.name}</h3>
                </div>
                <strong className="max-level">
                  MAX {romanLevels[enchantment.maxLevel] ?? enchantment.maxLevel}
                </strong>
              </header>
              <div className="enchantment-tags" aria-label={`${enchantment.name} availability`}>
                {enchantment.inEnchantingTable && <span>Enchanting table</span>}
                {enchantment.treasure && <span className="tag-treasure">Treasure</span>}
                {enchantment.curse && <span className="tag-curse">Curse</span>}
                {enchantment.tradeable && <span>Tradeable tag</span>}
              </div>
              <dl className="enchantment-facts">
                <div><dt>Book cost</dt><dd>{enchantment.bookCost} × level</dd></div>
                <div><dt>Enchanting weight</dt><dd>{enchantment.weight}</dd></div>
                <div><dt>Item groups</dt><dd>{enchantment.supportedItemIds.length}</dd></div>
              </dl>
              <details>
                <summary>Works with {enchantment.supportedItemIds.length} item groups</summary>
                <p>
                  {enchantment.supportedItemIds
                    .map((supportedId) => itemNames.get(supportedId) ?? supportedId)
                    .join(", ")}
                </p>
              </details>
              <div className="conflict-readout">
                <span>Conflicts</span>
                <p>
                  {enchantment.incompatibleWith.length > 0
                    ? enchantment.incompatibleWith
                        .map((id) => enchantmentNames.get(id) ?? id)
                        .join(", ")
                    : "No mutually exclusive enchantments"}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="reference-empty" data-testid="enchantment-ledger">
          <h3>No enchantments match</h3>
          <p>Clear a filter or try a broader enchantment name.</p>
          <button type="button" onClick={clearFilters}>Show all enchantments</button>
        </div>
      )}
    </section>
  );
}
