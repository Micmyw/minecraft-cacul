import { ForgeSvg, type ForgeIconProps } from "../forge-icon";

export function MenuIcon(props: ForgeIconProps) {
  return (
    <ForgeSvg fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <path d="M5 8h22M5 16h22M5 24h22" strokeLinecap="square" />
      <path d="M5 8h5M22 16h5M5 24h5" stroke="currentColor" strokeWidth="3.5" opacity=".42" />
    </ForgeSvg>
  );
}
