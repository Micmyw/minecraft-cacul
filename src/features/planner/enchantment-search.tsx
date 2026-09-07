"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SearchIcon } from "@/components/icons";
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeEnchantmentId, setActiveEnchantmentId] = useState<string | null>(
    null,
  );
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
  const enabledResults = available.filter(
    (enchantment) => !blockedIds.has(enchantment.id),
  );
  const activeResult = enabledResults.find(
    (enchantment) => enchantment.id === activeEnchantmentId,
  );
  const activeOptionId = activeResult
    ? `${id}-option-${activeResult.id}`
    : undefined;

  useEffect(() => {
    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !rootRef.current?.contains(target)) {
        setOpen(false);
        setActiveEnchantmentId(null);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointerDown);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
    };
  }, []);

  const closeResults = () => {
    setOpen(false);
    setActiveEnchantmentId(null);
  };

  const selectEnchantment = (enchantmentId: string) => {
    onSelect(enchantmentId);
    setQuery("");
    closeResults();
  };

  return (
    <div
      ref={rootRef}
      className="enchantment-search"
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (
          !nextTarget ||
          !event.currentTarget.contains(nextTarget as Node)
        ) {
          closeResults();
        }
      }}
    >
      <label className="field-label" htmlFor={`${id}-input`}>
        Add enchantment
      </label>
      <div className="search-input-shell">
        <SearchIcon size={19} />
        <input
          id={`${id}-input`}
          type="search"
          value={query}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && !disabled}
          aria-controls={resultsId}
          aria-activedescendant={open ? activeOptionId : undefined}
          onFocus={() => {
            setOpen(true);
            setActiveEnchantmentId(null);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveEnchantmentId(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);

              if (enabledResults.length === 0) {
                setActiveEnchantmentId(null);
                return;
              }

              const currentIndex = enabledResults.findIndex(
                (enchantment) => enchantment.id === activeEnchantmentId,
              );
              const nextIndex =
                event.key === "ArrowDown"
                  ? currentIndex < enabledResults.length - 1
                    ? currentIndex + 1
                    : 0
                  : currentIndex > 0
                    ? currentIndex - 1
                    : enabledResults.length - 1;
              setActiveEnchantmentId(enabledResults[nextIndex].id);
              return;
            }

            if (event.key === "Enter" && open && activeResult) {
              event.preventDefault();
              selectEnchantment(activeResult.id);
              return;
            }

            if (event.key === "Escape") {
              event.preventDefault();
              setQuery("");
              closeResults();
            }
          }}
        />
      </div>

      {disabled ? (
        <p className="field-hint">Choose a target item first.</p>
      ) : open ? (
        <div
          id={resultsId}
          className="enchantment-search-results"
          role="listbox"
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
                  id={`${id}-option-${enchantment.id}`}
                  type="button"
                  className="enchantment-search-result"
                  role="option"
                  tabIndex={-1}
                  aria-selected={activeEnchantmentId === enchantment.id}
                  aria-disabled={incompatible}
                  disabled={incompatible}
                  onMouseMove={() => {
                    if (!incompatible) {
                      setActiveEnchantmentId(enchantment.id);
                    }
                  }}
                  onClick={() => selectEnchantment(enchantment.id)}
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
