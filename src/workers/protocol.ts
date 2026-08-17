import { enchantments } from "@/data/java/26.2/enchantments";
import { items } from "@/data/java/26.2/items";
import type { CatalogSnapshot } from "@/domain/enchanting/types";

export type {
  CatalogEnchantment,
  CatalogItem,
  CatalogSnapshot,
  SolverWorkerEvent,
  SolverWorkerRequest,
} from "@/domain/enchanting/types";

export function createCatalogSnapshot(): CatalogSnapshot {
  return {
    edition: "java",
    gameVersion: "26.2",
    items: items.map(({ id, name }) => ({ id, name })),
    enchantments: enchantments.map(
      ({ id, name, maxLevel, supportedItemIds, incompatibleWith }) => ({
        id,
        name,
        maxLevel,
        supportedItemIds: [...supportedItemIds],
        incompatibleWith: [...incompatibleWith],
      }),
    ),
  };
}
