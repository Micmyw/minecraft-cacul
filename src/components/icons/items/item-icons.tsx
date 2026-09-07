import { ForgeSvg, type ForgeIconProps } from "../forge-icon";

const outline = "var(--forge-icon-outline, #081017)";
const obsidian = "var(--forge-icon-obsidian, #17232d)";
const steel = "var(--forge-icon-steel, #718798)";
const steelLight = "var(--forge-icon-steel-light, #b8cad5)";
const steelDark = "var(--forge-icon-deep-steel, #334854)";
const emerald = "var(--forge-icon-emerald, #52e6a5)";
const cyan = "var(--forge-icon-cyan, #62dcff)";
const amethyst = "var(--forge-icon-amethyst, #9b6bea)";
const amethystLight = "var(--forge-icon-amethyst-highlight, #c7a7ff)";
const gold = "var(--forge-icon-gold, #e6bd62)";
const wood = "var(--forge-icon-wood, #8b5c3c)";
const woodLight = "var(--forge-icon-wood-light, #bd8150)";

export function AnvilIcon(props: ForgeIconProps) {
  return (
    <ForgeSvg {...props}>
      <path
        d="M5 7h22l-3 5h-5v4l5 5v5H8v-5l5-5v-4H8L5 7Z"
        fill={steelDark}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M6.5 8.5h19L23.5 11h-15l-2-2.5Z" fill={steelLight} />
      <path d="M13 12h6v5l3 4H10l3-4v-5Z" fill={steel} />
      <path d="M10 21h12v3H10z" fill={obsidian} />
      <path d="M18 13h1v4l2 3h-2l-1-3v-4Z" fill={cyan} opacity=".64" />
    </ForgeSvg>
  );
}

export function EnchantedBookIcon(props: ForgeIconProps) {
  return (
    <ForgeSvg {...props}>
      <path
        d="M4.5 8.5 14 6l2 3 2-3 9.5 2.5V25L18 22.5l-2 2-2-2L4.5 25V8.5Z"
        fill={obsidian}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M6 10 14 8v12.5l-8 2V10Z" fill={amethyst} />
      <path d="m18 8 8 2v12.5l-8-2V8Z" fill="#6f46b6" />
      <path d="M16 10v12" stroke={amethystLight} strokeWidth="1.5" />
      <path d="m8 12 4-1v2l-4 1v-2Zm0 4 4-1v1.5l-4 1v-1.5Z" fill={amethystLight} />
      <path d="m20 11 4 1v2l-4-1v-2Zm0 4 4 1v1.5l-4-1V15Z" fill={cyan} opacity=".82" />
      <path d="m16 13-2 3 2 3 2-3-2-3Z" fill={emerald} />
    </ForgeSvg>
  );
}

export function SwordIcon(props: ForgeIconProps) {
  return (
    <ForgeSvg {...props}>
      <path
        d="m24.5 4 3.5.5-.5 3.5-12 12-3.5-3.5 12.5-12.5Z"
        fill={cyan}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m24 6 1.5.2-.2 1.5-10 10-1.5-1.5L24 6Z" fill="#c7f5ff" />
      <path
        d="m10 15 7 7-2.5 2.5-2.2-2.2-5.8 5.8-2.6-2.6 5.8-5.8-2.2-2.2L10 15Z"
        fill={gold}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m7.8 22.2 2 2-3.3 3.3-2-2 3.3-3.3Z" fill={woodLight} />
    </ForgeSvg>
  );
}

export function InventoryCrateIcon(props: ForgeIconProps) {
  return (
    <ForgeSvg {...props}>
      <path
        d="M4 9 16 4l12 5v16L16 29 4 25V9Z"
        fill={wood}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m5.5 9.8 10.5 4 10.5-4L16 5.5 5.5 9.8Z" fill={woodLight} />
      <path d="M16 13.8V27l10.5-3.2v-14L16 13.8Z" fill="#72442f" />
      <path d="m4.8 16.2 11.2 4 11.2-4v3L16 23.2l-11.2-4v-3Z" fill={steelDark} />
      <path d="M14 18.8h4v5h-4z" fill={gold} stroke={outline} strokeWidth="1" />
      <path d="M15 19.8h2v1.5h-2z" fill="#fff0ad" />
    </ForgeSvg>
  );
}

export function GemIcon(props: ForgeIconProps) {
  return (
    <ForgeSvg {...props}>
      <path
        d="m9 5-5 8 12 15 12-15-5-8H9Z"
        fill={emerald}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m9 6.5-3.5 6h7L16 6.5H9Z" fill="#a9ffd2" />
      <path d="M16 6.5 12.5 13h7L16 6.5Z" fill="#72f7ba" />
      <path d="m23 6.5 3.5 6h-7L16 6.5h7Z" fill="#25bd7c" />
      <path d="m5.5 14 9 11.2-2-11.2h-7Z" fill="#39d995" />
      <path d="m14 14 2 11 2-11h-4Z" fill="#b7ffdd" />
      <path d="m19.5 14-2 11.2 9-11.2h-7Z" fill="#1ba56d" />
    </ForgeSvg>
  );
}

export function ArmorIcon(props: ForgeIconProps) {
  return (
    <ForgeSvg {...props}>
      <path
        d="m10 5 6 2 6-2 6 5-4 6v11H8V16l-4-6 6-5Z"
        fill={steelDark}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m10 6.5 4.5 1.5L12 12H8l-2-2 4-3.5Zm12 0L17.5 8 20 12h4l2-2-4-3.5Z" fill={cyan} />
      <path d="m14.5 8 1.5.5 1.5-.5 2.5 4-1.5 3v10h-5V15L12 12l2.5-4Z" fill={steel} />
      <path d="M9.5 16h4v9.5h-4zm9 0h4v9.5h-4z" fill="#536b7a" />
      <path d="M14 17h4v2h-4z" fill={emerald} opacity=".78" />
    </ForgeSvg>
  );
}

export function ToolIcon(props: ForgeIconProps) {
  return (
    <ForgeSvg {...props}>
      <path
        d="M5 7 14 4l4 3-2.8 2.8-4-1.5-2.5 2.5L5 7Z"
        fill={cyan}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m16 7 11 11-3 3L13 10l3-3Z"
        fill={woodLight}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m17 9 8 8-1.5 1.5-8-8L17 9Z" fill="#efad68" />
      <path d="m23 21 2-2 3 3-2 5h-4l1-6Z" fill={steelDark} />
      <path d="M7 6.8 14 5l1.5 1.5-4.5.5-2 2-2-2.2Z" fill="#c7f5ff" />
    </ForgeSvg>
  );
}

export function BowIcon(props: ForgeIconProps) {
  return (
    <ForgeSvg {...props}>
      <path
        d="M8 4c8 2 14 8 16 16l-3 8-3-2 2-6c-2-5.5-6.5-10-12-12L3 10 1 7l7-3Z"
        fill={woodLight}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 6 22 26" stroke={steelLight} strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="m25 7 3-3m-3 3-3-1m3 1 1 3M9 23l16-16"
        stroke={cyan}
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path d="m8 24-4 4m4-4-1-3m1 3 3 1" stroke={gold} strokeWidth="2" strokeLinecap="square" />
    </ForgeSvg>
  );
}

export function TridentIcon(props: ForgeIconProps) {
  return (
    <ForgeSvg {...props}>
      <path
        d="M14 4h4v7l3-3V4h4v7l-7 7v10h-4V18l-7-7V4h4v4l3 3V4Z"
        fill={cyan}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M15.5 17h1.5v9h-1.5zM8.5 5.5H10v5l4 4v1.8l-5.5-5.5V5.5Z" fill="#c7f5ff" />
      <path d="m22 13 3-3v2l-5 5h-2l4-4Z" fill={emerald} opacity=".8" />
    </ForgeSvg>
  );
}

export function CompassIcon(props: ForgeIconProps) {
  return (
    <ForgeSvg {...props}>
      <path
        d="m16 3 3 3h5l2 2v5l3 3-3 3v5l-2 2h-5l-3 3-3-3H8l-2-2v-5l-3-3 3-3V8l2-2h5l3-3Z"
        fill={steelDark}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M16 7a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" fill={steelLight} />
      <path d="m18 10-1 7-7 5 5-7 3-5Z" fill={amethyst} />
      <path d="m14 22 1-7 7-5-5 7-3 5Z" fill={emerald} />
      <path d="M16 14.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" fill={obsidian} />
    </ForgeSvg>
  );
}
