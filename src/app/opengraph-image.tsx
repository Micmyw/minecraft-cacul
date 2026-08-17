import { ImageResponse } from "next/og";

export const alt = "AnvilPilot Minecraft Enchantment Calculator for Java Edition 26.2";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        color: "#EEF0E8",
        background: "#0B0F0E",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 34,
          display: "flex",
          border: "2px solid #242D28",
          background: "#151B18",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 18,
          height: "100%",
          display: "flex",
          background: "#F3AE45",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          padding: "82px 88px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <svg width="58" height="48" viewBox="0 0 116 96" aria-hidden="true">
              <path fill="#F3AE45" d="M8 8h100v24L84 48H68v18h24v16H24V66h24V48H32L8 32z" />
            </svg>
            <span style={{ color: "#F3AE45", fontSize: 32, fontWeight: 700, letterSpacing: 2 }}>
              ANVILPILOT
            </span>
          </div>
          <span style={{ color: "#91C95B", fontSize: 24, letterSpacing: 2 }}>
            JAVA EDITION 26.2
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ maxWidth: 930, fontSize: 72, fontWeight: 700, lineHeight: 1.04 }}>
            Minecraft Enchantment Calculator
          </span>
          <span style={{ color: "#C8CEC5", fontSize: 34 }}>
            Plan a lower-cost anvil order
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 160, height: 4, display: "flex", background: "#F3AE45" }} />
          <span style={{ color: "#A8B0A8", fontSize: 20, letterSpacing: 3 }}>
            PLAN / COMBINE / PRESERVE
          </span>
        </div>
      </div>
    </div>,
    size,
  );
}
