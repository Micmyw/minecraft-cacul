import type { ReactNode, SVGProps } from "react";

export type ForgeIconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  /** Uses a square canvas unless width or height is supplied explicitly. */
  size?: number | string;
  /** Adds an accessible SVG title and changes the icon role to img. */
  title?: string;
};

type ForgeSvgProps = ForgeIconProps & {
  children: ReactNode;
};

/**
 * Shared accessible SVG frame for the AnvilPilot icon family.
 * Icons are decorative by default; a non-empty title promotes them to an image.
 */
export function ForgeSvg({
  children,
  focusable = "false",
  height,
  role,
  size = 24,
  title,
  viewBox = "0 0 32 32",
  width,
  "aria-hidden": ariaHidden,
  ...svgProps
}: ForgeSvgProps) {
  const accessibleTitle = title?.trim();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={width ?? size}
      height={height ?? size}
      role={accessibleTitle ? "img" : role}
      aria-hidden={accessibleTitle ? undefined : (ariaHidden ?? true)}
      focusable={focusable}
      {...svgProps}
    >
      {accessibleTitle ? <title>{accessibleTitle}</title> : null}
      {children}
    </svg>
  );
}
