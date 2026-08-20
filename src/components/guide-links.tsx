import Link from "next/link";

export function GuideLinks({
  current,
}: {
  current: "prior-work" | "too-expensive";
}) {
  return (
    <nav className="guide-links" aria-label="Related anvil guides">
      <strong>Continue learning</strong>
      {current === "prior-work" ? (
        <Link href="/minecraft-anvil-too-expensive">Why the Anvil Says Too Expensive</Link>
      ) : (
        <Link href="/minecraft-prior-work-penalty">Minecraft Prior Work Penalty</Link>
      )}
      <Link href="/#calculator">Minecraft Enchantment Calculator</Link>
    </nav>
  );
}
