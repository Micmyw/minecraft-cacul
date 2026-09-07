import { ForgeSvg, type ForgeIconProps } from "../forge-icon";

type StatusIconFrameProps = ForgeIconProps & {
  children: React.ReactNode;
};

function StatusIconFrame({ children, ...props }: StatusIconFrameProps) {
  return (
    <ForgeSvg fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <g strokeLinecap="square" strokeLinejoin="round">
        {children}
      </g>
    </ForgeSvg>
  );
}

export function CheckIcon(props: ForgeIconProps) {
  return (
    <StatusIconFrame {...props}>
      <path d="m5 17 7 7L27 8" strokeWidth="3" />
      <path d="m12 20 12-12" opacity=".38" />
    </StatusIconFrame>
  );
}

export function SparkIcon(props: ForgeIconProps) {
  return (
    <ForgeSvg {...props}>
      <path
        d="m16 3 2.7 8.3L27 14l-8.3 2.7L16 25l-2.7-8.3L5 14l8.3-2.7L16 3Z"
        fill="currentColor"
      />
      <path d="m25 21 1.2 3.8L30 26l-3.8 1.2L25 31l-1.2-3.8L20 26l3.8-1.2L25 21Z" fill="currentColor" opacity=".5" />
      <path d="m7 2 .9 2.6 2.6.9-2.6.9L7 9l-.9-2.6-2.6-.9 2.6-.9L7 2Z" fill="currentColor" opacity=".5" />
    </ForgeSvg>
  );
}

export function AlertIcon(props: ForgeIconProps) {
  return (
    <StatusIconFrame {...props}>
      <path d="m16 4 13 23H3L16 4Z" />
      <path d="M16 11v8" strokeWidth="3" />
      <path d="M16 23h.01" strokeWidth="3" />
    </StatusIconFrame>
  );
}

export function ErrorIcon(props: ForgeIconProps) {
  return (
    <StatusIconFrame {...props}>
      <path d="m10 4 12 0 6 6v12l-6 6H10l-6-6V10l6-6Z" />
      <path d="m11 11 10 10m0-10L11 21" strokeWidth="2.5" />
    </StatusIconFrame>
  );
}

export function EmptyIcon(props: ForgeIconProps) {
  return (
    <StatusIconFrame {...props}>
      <path d="M5 10 16 5l11 5v15l-11 4-11-4V10Z" />
      <path d="m5 10 11 4 11-4M16 14v15" opacity=".58" />
      <path d="M11 20h10" />
    </StatusIconFrame>
  );
}

/** Static segmented loader; consumers control any rotation and reduced-motion behavior. */
export function SpinnerIcon(props: ForgeIconProps) {
  return (
    <ForgeSvg fill="none" viewBox="0 0 32 32" {...props}>
      <path
        d="M16 4a12 12 0 0 1 12 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
      <path
        d="M28 16a12 12 0 0 1-12 12A12 12 0 0 1 4 16 12 12 0 0 1 16 4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
        opacity=".24"
      />
      <path d="M25.5 12.5 28 16l2.5-3.5" fill="currentColor" />
    </ForgeSvg>
  );
}
