import Link from "next/link";
import { AnvilIcon, ArrowRightIcon } from "@/components/icons";

export function GuideCta() {
  return (
    <aside className="guide-cta">
      <span className="guide-cta-icon" aria-hidden="true"><AnvilIcon size={38} /></span>
      <div>
        <span className="section-kicker">BUILD A VERIFIED PLAN</span>
        <h2>Plan your enchantment order</h2>
        <p>Enter the books and prior-work values you actually have, then compare every anvil step.</p>
      </div>
      <Link href="/#calculator">Open the Minecraft Enchantment Calculator <ArrowRightIcon size={18} /></Link>
    </aside>
  );
}
