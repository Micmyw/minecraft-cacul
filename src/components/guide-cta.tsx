import Link from "next/link";

export function GuideCta() {
  return (
    <aside className="guide-cta">
      <div>
        <span className="section-kicker">BUILD A VERIFIED PLAN</span>
        <h2>Plan your enchantment order</h2>
        <p>Enter the books and prior-work values you actually have, then compare every anvil step.</p>
      </div>
      <Link href="/#calculator">Open the Minecraft Enchantment Calculator</Link>
    </aside>
  );
}
