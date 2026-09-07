import { ForgeSvg, type ForgeIconProps } from "../forge-icon";

type ActionIconFrameProps = ForgeIconProps & {
  children: React.ReactNode;
};

function ActionIconFrame({ children, ...props }: ActionIconFrameProps) {
  return (
    <ForgeSvg fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <g strokeLinecap="square" strokeLinejoin="round">
        {children}
      </g>
    </ForgeSvg>
  );
}

export function SearchIcon(props: ForgeIconProps) {
  return (
    <ActionIconFrame {...props}>
      <path d="M14 5a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />
      <path d="m20.5 20.5 7 7" strokeWidth="3" />
      <path d="M10 10h3M9 13v-3" opacity=".58" />
    </ActionIconFrame>
  );
}

export function CopyIcon(props: ForgeIconProps) {
  return (
    <ActionIconFrame {...props}>
      <path d="M11 9h14v18H11z" />
      <path d="M7 23H4V5h14v4" opacity=".58" />
      <path d="M15 14h6M15 18h6" opacity=".58" />
    </ActionIconFrame>
  );
}

export function ShareIcon(props: ForgeIconProps) {
  return (
    <ActionIconFrame {...props}>
      <path d="M11 11 22 6" />
      <path d="m11 20 11 6" />
      <path d="M8 8h4v6H8zM22 3h6v6h-6zM22 23h6v6h-6z" />
    </ActionIconFrame>
  );
}

export function ResetIcon(props: ForgeIconProps) {
  return (
    <ActionIconFrame {...props}>
      <path d="M7 12a10 10 0 1 1 1 10" />
      <path d="M7 5v7h7" />
      <path d="M16 10v7l4 3" opacity=".58" />
    </ActionIconFrame>
  );
}

export function PlusIcon(props: ForgeIconProps) {
  return (
    <ActionIconFrame {...props}>
      <path d="M16 6v20M6 16h20" strokeWidth="2.5" />
    </ActionIconFrame>
  );
}

export function RemoveIcon(props: ForgeIconProps) {
  return (
    <ActionIconFrame {...props}>
      <path d="M6 16h20" strokeWidth="2.5" />
    </ActionIconFrame>
  );
}

export function EditIcon(props: ForgeIconProps) {
  return (
    <ActionIconFrame {...props}>
      <path d="m6 23-1 5 5-1L27 10l-4-4L6 23Z" />
      <path d="m20 9 4 4M7 22l4 4" opacity=".58" />
    </ActionIconFrame>
  );
}

export function DuplicateIcon(props: ForgeIconProps) {
  return (
    <ActionIconFrame {...props}>
      <path d="M10 8h16v19H10z" />
      <path d="M6 23H3V4h16v4" opacity=".58" />
      <path d="M18 13v9M13.5 17.5h9" />
    </ActionIconFrame>
  );
}

export function FilterIcon(props: ForgeIconProps) {
  return (
    <ActionIconFrame {...props}>
      <path d="M4 6h24L19 17v8l-6 3V17L4 6Z" />
      <path d="M9 10h14" opacity=".58" />
    </ActionIconFrame>
  );
}

export function ExpandIcon(props: ForgeIconProps) {
  return (
    <ActionIconFrame {...props}>
      <path d="M5 13V5h8M19 5h8v8M27 19v8h-8M13 27H5v-8" />
      <path d="m6 6 7 7m13-7-7 7m7 13-7-7M6 26l7-7" opacity=".58" />
    </ActionIconFrame>
  );
}

export function ArrowDownIcon(props: ForgeIconProps) {
  return (
    <ActionIconFrame {...props}>
      <path d="M7 12.5 16 22l9-9.5" strokeWidth="2.5" />
    </ActionIconFrame>
  );
}

export function ArrowRightIcon(props: ForgeIconProps) {
  return (
    <ActionIconFrame {...props}>
      <path d="m12.5 7 9.5 9-9.5 9" strokeWidth="2.5" />
    </ActionIconFrame>
  );
}
