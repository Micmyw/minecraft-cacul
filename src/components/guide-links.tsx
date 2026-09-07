import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export function GuideLinks({
  current,
}: {
  current: "prior-work" | "too-expensive";
}) {
  return (
    <nav className="guide-links" aria-label="Related anvil guides">
      <strong>Continue learning</strong>
      {current === "prior-work" ? (
        <Link href="/minecraft-anvil-too-expensive">Why the Anvil Says Too Expensive <ArrowRightIcon size={15} /></Link>
      ) : (
        <Link href="/minecraft-prior-work-penalty">Minecraft Prior Work Penalty <ArrowRightIcon size={15} /></Link>
      )}
      <Link href="/minecraft-enchantments">Minecraft Enchantments Reference <ArrowRightIcon size={15} /></Link>
      <Link href="/#calculator">Minecraft Enchantment Calculator <ArrowRightIcon size={15} /></Link>
    </nav>
  );
}
