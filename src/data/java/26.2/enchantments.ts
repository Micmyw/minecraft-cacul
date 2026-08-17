import type { EnchantmentId, ItemId } from "@/domain/enchanting/types";

export type EnchantmentDefinition = {
  id: EnchantmentId;
  name: string;
  maxLevel: number;
  anvilCost: number;
  bookCost: number;
  supportedItemIds: readonly ItemId[];
  exclusiveSet: readonly EnchantmentId[];
  incompatibleWith: readonly EnchantmentId[];
};

const armor = ["helmet", "turtle_helmet", "chestplate", "leggings", "boots"];
const headArmor = ["helmet", "turtle_helmet"];
const footArmor = ["boots"];
const durability = [
  ...armor,
  "elytra", "shield", "sword", "axe", "pickaxe", "shovel", "hoe", "bow",
  "crossbow", "trident", "flint_and_steel", "shears", "brush", "fishing_rod",
  "carrot_on_a_stick", "warped_fungus_on_a_stick", "mace", "spear",
];
const mining = ["axe", "pickaxe", "shovel", "hoe", "shears"];
const miningLoot = ["axe", "pickaxe", "shovel", "hoe"];
const weapon = ["sword", "spear", "axe", "mace"];
const sharpWeapon = ["sword", "spear", "axe"];
const meleeWeapon = ["sword", "spear"];
const damage = ["sharpness", "smite", "bane_of_arthropods", "impaling", "density", "breach"];
const armorProtection = ["protection", "blast_protection", "fire_protection", "projectile_protection"];

function definition(
  id: string,
  name: string,
  maxLevel: number,
  anvilCost: number,
  supportedItemIds: readonly string[],
  incompatibleWith: readonly string[] = [],
): EnchantmentDefinition {
  return {
    id,
    name,
    maxLevel,
    anvilCost,
    bookCost: Math.max(1, Math.floor(anvilCost / 2)),
    supportedItemIds,
    exclusiveSet: incompatibleWith,
    incompatibleWith,
  };
}

// Values are a typed transcription of Java Edition 26.2's data-driven
// enchantment definitions. No game assets are shipped with this project.
export const enchantments = [
  definition("aqua_affinity", "Aqua Affinity", 1, 4, headArmor),
  definition("bane_of_arthropods", "Bane of Arthropods", 5, 2, weapon, damage.filter((id) => id !== "bane_of_arthropods")),
  definition("binding_curse", "Curse of Binding", 1, 8, [...armor, "elytra", "carved_pumpkin", "head"]),
  definition("blast_protection", "Blast Protection", 4, 4, armor, armorProtection.filter((id) => id !== "blast_protection")),
  definition("breach", "Breach", 4, 4, ["mace"], damage.filter((id) => id !== "breach")),
  definition("channeling", "Channeling", 1, 8, ["trident"], ["riptide"]),
  definition("density", "Density", 5, 2, ["mace"], damage.filter((id) => id !== "density")),
  definition("depth_strider", "Depth Strider", 3, 4, footArmor, ["frost_walker"]),
  definition("efficiency", "Efficiency", 5, 1, mining),
  definition("feather_falling", "Feather Falling", 4, 2, footArmor),
  definition("fire_aspect", "Fire Aspect", 2, 4, [...meleeWeapon, "mace"]),
  definition("fire_protection", "Fire Protection", 4, 2, armor, armorProtection.filter((id) => id !== "fire_protection")),
  definition("flame", "Flame", 1, 4, ["bow"]),
  definition("fortune", "Fortune", 3, 4, miningLoot, ["silk_touch"]),
  definition("frost_walker", "Frost Walker", 2, 4, footArmor, ["depth_strider"]),
  definition("impaling", "Impaling", 5, 4, ["trident"], damage.filter((id) => id !== "impaling")),
  definition("infinity", "Infinity", 1, 8, ["bow"], ["mending"]),
  definition("knockback", "Knockback", 2, 2, meleeWeapon),
  definition("looting", "Looting", 3, 4, meleeWeapon),
  definition("loyalty", "Loyalty", 3, 2, ["trident"], ["riptide"]),
  definition("luck_of_the_sea", "Luck of the Sea", 3, 4, ["fishing_rod"]),
  definition("lunge", "Lunge", 3, 2, ["spear"]),
  definition("lure", "Lure", 3, 4, ["fishing_rod"]),
  definition("mending", "Mending", 1, 4, durability, ["infinity"]),
  definition("multishot", "Multishot", 1, 4, ["crossbow"], ["piercing"]),
  definition("piercing", "Piercing", 4, 1, ["crossbow"], ["multishot"]),
  definition("power", "Power", 5, 1, ["bow"]),
  definition("projectile_protection", "Projectile Protection", 4, 2, armor, armorProtection.filter((id) => id !== "projectile_protection")),
  definition("protection", "Protection", 4, 1, armor, armorProtection.filter((id) => id !== "protection")),
  definition("punch", "Punch", 2, 4, ["bow"]),
  definition("quick_charge", "Quick Charge", 3, 2, ["crossbow"]),
  definition("respiration", "Respiration", 3, 4, headArmor),
  definition("riptide", "Riptide", 3, 4, ["trident"], ["channeling", "loyalty"]),
  definition("sharpness", "Sharpness", 5, 1, sharpWeapon, damage.filter((id) => id !== "sharpness")),
  definition("silk_touch", "Silk Touch", 1, 8, miningLoot, ["fortune"]),
  definition("smite", "Smite", 5, 2, weapon, damage.filter((id) => id !== "smite")),
  definition("soul_speed", "Soul Speed", 3, 8, footArmor),
  definition("sweeping_edge", "Sweeping Edge", 3, 4, ["sword"]),
  definition("swift_sneak", "Swift Sneak", 3, 8, ["leggings"]),
  definition("thorns", "Thorns", 3, 8, armor),
  definition("unbreaking", "Unbreaking", 3, 2, durability),
  definition("vanishing_curse", "Curse of Vanishing", 1, 8, [...durability, "compass", "carved_pumpkin", "head"]),
  definition("wind_burst", "Wind Burst", 3, 4, ["mace"]),
] as const satisfies readonly EnchantmentDefinition[];

export const enchantmentById = new Map<EnchantmentId, EnchantmentDefinition>(
  enchantments.map((enchantment) => [enchantment.id, enchantment]),
);

export function getEnchantmentDefinition(
  id: EnchantmentId,
): EnchantmentDefinition | undefined {
  return enchantmentById.get(id);
}

export function isEnchantmentApplicable(id: EnchantmentId, itemId: ItemId): boolean {
  return getEnchantmentDefinition(id)?.supportedItemIds.includes(itemId) ?? false;
}
