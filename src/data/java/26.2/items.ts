import type { ItemId } from "@/domain/enchanting/types";

export type ItemDefinition = {
  id: ItemId;
  name: string;
  shortName: string;
};

export const items = [
  { id: "helmet", name: "Helmet", shortName: "Helmet" },
  { id: "turtle_helmet", name: "Turtle Shell", shortName: "Turtle Shell" },
  { id: "chestplate", name: "Chestplate", shortName: "Chestplate" },
  { id: "leggings", name: "Leggings", shortName: "Leggings" },
  { id: "boots", name: "Boots", shortName: "Boots" },
  { id: "elytra", name: "Elytra", shortName: "Elytra" },
  { id: "sword", name: "Sword", shortName: "Sword" },
  { id: "axe", name: "Axe", shortName: "Axe" },
  { id: "mace", name: "Mace", shortName: "Mace" },
  { id: "spear", name: "Spear", shortName: "Spear" },
  { id: "trident", name: "Trident", shortName: "Trident" },
  { id: "bow", name: "Bow", shortName: "Bow" },
  { id: "crossbow", name: "Crossbow", shortName: "Crossbow" },
  { id: "pickaxe", name: "Pickaxe", shortName: "Pickaxe" },
  { id: "shovel", name: "Shovel", shortName: "Shovel" },
  { id: "hoe", name: "Hoe", shortName: "Hoe" },
  { id: "shield", name: "Shield", shortName: "Shield" },
  { id: "brush", name: "Brush", shortName: "Brush" },
  { id: "fishing_rod", name: "Fishing Rod", shortName: "Fishing Rod" },
  { id: "shears", name: "Shears", shortName: "Shears" },
  { id: "flint_and_steel", name: "Flint and Steel", shortName: "Flint and Steel" },
  { id: "carrot_on_a_stick", name: "Carrot on a Stick", shortName: "Carrot on a Stick" },
  { id: "warped_fungus_on_a_stick", name: "Warped Fungus on a Stick", shortName: "Warped Fungus on a Stick" },
  { id: "carved_pumpkin", name: "Carved Pumpkin", shortName: "Carved Pumpkin" },
  { id: "head", name: "Mob or Player Head", shortName: "Head" },
  { id: "compass", name: "Compass", shortName: "Compass" },
] as const satisfies readonly ItemDefinition[];

export const itemById = new Map<ItemId, ItemDefinition>(
  items.map((item) => [item.id, item]),
);

export function getItemDefinition(id: ItemId | null): ItemDefinition | undefined {
  return id ? itemById.get(id) : undefined;
}
