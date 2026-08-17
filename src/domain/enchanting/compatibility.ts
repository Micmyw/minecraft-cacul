import { getEnchantmentDefinition } from "@/data/java/26.2/enchantments";
import type { EnchantmentId } from "./types";

export function areEnchantmentsCompatible(
  leftId: EnchantmentId,
  rightId: EnchantmentId,
): boolean {
  if (leftId === rightId) return true;
  const left = getEnchantmentDefinition(leftId);
  const right = getEnchantmentDefinition(rightId);
  if (!left || !right) return false;
  return (
    !left.incompatibleWith.includes(rightId) &&
    !right.incompatibleWith.includes(leftId)
  );
}

export function findCompatibilityConflicts(
  ids: readonly EnchantmentId[],
): [EnchantmentId, EnchantmentId][] {
  const unique = [...new Set(ids)].sort();
  const conflicts: [EnchantmentId, EnchantmentId][] = [];
  for (let left = 0; left < unique.length; left += 1) {
    for (let right = left + 1; right < unique.length; right += 1) {
      if (!areEnchantmentsCompatible(unique[left], unique[right])) {
        conflicts.push([unique[left], unique[right]]);
      }
    }
  }
  return conflicts;
}
