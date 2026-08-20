import { useId } from "react";
import type { EnchantmentLevel } from "@/domain/enchanting/types";
import type { CatalogSnapshot } from "@/workers/protocol";
import { EnchantmentSearch } from "./enchantment-search";

export function EnchantmentPicker({
  catalog,
  itemId,
  selected,
  onChange,
  label,
  allowAll = false,
}: {
  catalog: CatalogSnapshot;
  itemId: string | null;
  selected: EnchantmentLevel[];
  onChange: (enchantments: EnchantmentLevel[]) => void;
  label: string;
  allowAll?: boolean;
}) {
  const id = useId();

  return (
    <fieldset className="enchantment-picker">
      <legend>{label}</legend>
      <EnchantmentSearch
        catalog={catalog}
        itemId={itemId}
        selected={selected}
        allowAll={allowAll}
        onSelect={(enchantmentId) => {
          const enchantment = catalog.enchantments.find(
            (entry) => entry.id === enchantmentId,
          );
          if (!enchantment) return;
          onChange([
            ...selected,
            { enchantmentId: enchantment.id, level: enchantment.maxLevel },
          ]);
        }}
      />

      {selected.length > 0 ? (
        <div className="selected-enchantments">
          {selected.map((enchantment) => {
            const definition = catalog.enchantments.find(
              (entry) => entry.id === enchantment.enchantmentId,
            );
            if (!definition) return null;
            return (
              <div className="enchantment-row" key={enchantment.enchantmentId}>
                <span>{definition.name}</span>
                <label className="sr-only" htmlFor={`${id}-${enchantment.enchantmentId}`}>
                  {definition.name} level
                </label>
                <select
                  id={`${id}-${enchantment.enchantmentId}`}
                  value={enchantment.level}
                  onChange={(event) =>
                    onChange(
                      selected.map((item) =>
                        item.enchantmentId === enchantment.enchantmentId
                          ? { ...item, level: Number(event.target.value) }
                          : item,
                      ),
                    )
                  }
                >
                  {Array.from({ length: definition.maxLevel }, (_, index) => index + 1).map(
                    (level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ),
                  )}
                </select>
                <button
                  type="button"
                  className="text-button danger"
                  aria-label={`Remove ${definition.name}`}
                  onClick={() =>
                    onChange(
                      selected.filter(
                        (item) => item.enchantmentId !== enchantment.enchantmentId,
                      ),
                    )
                  }
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="field-hint">No enchantments added yet.</p>
      )}
    </fieldset>
  );
}
