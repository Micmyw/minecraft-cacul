import { ForgeSvg, type ForgeIconProps } from "../forge-icon";

/** Abstract forge/anvil mark with an emerald rune. */
export function BrandMark(props: ForgeIconProps) {
  return (
    <ForgeSvg {...props}>
      <path
        d="M4 9.5 8 5h16l4 4.5-3 4.5h-3v3.5l3 3V27H7v-6.5l3-3V14H7L4 9.5Z"
        fill="var(--forge-icon-obsidian, #17232d)"
        stroke="var(--forge-icon-outline, #081017)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M5 9.5 8.5 5h15L27 9.5l-3 2.5H8L5 9.5Z"
        fill="var(--forge-icon-amethyst, #9b6bea)"
      />
      <path
        d="m9 6.5-2 3h18l-2-3H9Z"
        fill="var(--forge-icon-amethyst-highlight, #c7a7ff)"
        opacity=".72"
      />
      <path
        d="M11 13h10v5l3 3H8l3-3v-5Z"
        fill="var(--forge-icon-steel, #516777)"
      />
      <path
        d="M9 21h14v4H9z"
        fill="var(--forge-icon-deep-steel, #2d414f)"
      />
      <path
        d="m16 14-3 4 3 4 3-4-3-4Zm0 2.6 1.1 1.4-1.1 1.4-1.1-1.4 1.1-1.4Z"
        fill="var(--forge-icon-emerald, #52e6a5)"
      />
      <path
        d="M10 14h2v4l-2 2H8.5l1.5-2v-4Zm10 0h2v4l1.5 2H22l-2-2v-4Z"
        fill="var(--forge-icon-cyan, #62dcff)"
        opacity=".72"
      />
      <path
        d="M7 22h2v3H7zm16 0h2v3h-2z"
        fill="var(--forge-icon-gold, #e6bd62)"
      />
    </ForgeSvg>
  );
}
