import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#151B18",
      }}
    >
      <svg width="140" height="116" viewBox="0 0 116 96" aria-hidden="true">
        <path fill="#F3AE45" d="M8 8h100v24L84 48H68v18h24v16H24V66h24V48H32L8 32z" />
      </svg>
    </div>,
    size,
  );
}
