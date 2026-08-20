"use client";

import { useId, useState } from "react";
import type { EnchantmentLevel } from "@/domain/enchanting/types";
import type { CatalogSnapshot } from "@/workers/protocol";

const romanLevels = ["", "I", "II", "III", "IV", "V"];

type EnchantmentSearchProps = {
  catalog: CatalogSnapshot;
  itemId: string | null;
  selected: EnchantmentLevel[];
  allowAll?: boolean;
  onSelect: (enchantmentId: string) => void;
};

export function EnchantmentSearch({
  catalog,
  itemId,
  selected,
  allowAll = false,
  onSelect,
}: EnchantmentSearchProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selectedIds = new Set(selected.map((entry) => entry.enchantmentId));
  const blockedIds = new Set(
    selected.flatMap(
      (entry) =>
        catalog.enchantments.find(
          (candidate) => candidate.id === entry.enchantmentId,
        )?.incompatibleWith ?? [],
    ),
  );
  const normalizedQuery = query.trim().toLocaleLowerCase("en");
  const available = catalog.enchantments
    .filter(
      (enchantment) =>
        !selectedIds.has(enchantment.id) &&
        (allowAll || Boolean(itemId && enchantment.supportedItemIds.includes(itemId))) &&
        enchantment.name.toLocaleLowerCase("en").includes(normalizedQuery),
    )
    .sort((left, right) => {
      if (left.name === right.name) return left.id < right.id ? -1 : 1;
      return left.name < right.name ? -1 : 1;
    });
  const disabled = !allowAll && !itemId;
  const resultsId = `${id}-results`;

  return (
    <div className="enchantment-search">
      <label className="field-label" htmlFor={`${id}-input`}>
        Add enchantment
      </label>
      <input
        id={`${id}-input`}
        type="search"
        value={query}
        disabled={disabled}
        autoComplete="off"
        aria-controls={resultsId}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          setQuery("");
          setOpen(false);
        }}
      />

      {disabled ? (
        <p className="field-hint">Choose a target item first.</p>
      ) : open ? (
        <div
          id={resultsId}
          className="enchantment-search-results"
          aria-label="Available enchantments"
        >
          {available.length === 0 ? (
            <p className="enchantment-search-empty">No enchantments match your search.</p>
          ) : (
            available.map((enchantment) => {
              const incompatible = blockedIds.has(enchantment.id);
              return (
                <button
                  key={enchantment.id}
                  type="button"
                  className="enchantment-search-result"
                  disabled={incompatible}
                  onClick={() => {
                    onSelect(enchantment.id);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <strong>{enchantment.name}</strong>
                  <span>
                    Max level: {romanLevels[enchantment.maxLevel] ?? enchantment.maxLevel}
                  </span>
                  {incompatible && <em>Incompatible</em>}
                </button>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
