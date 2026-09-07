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
        color: "#F5F7FF",
        background: "#07131F",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 34,
          display: "flex",
          border: "2px solid #153E4A",
          background: "#0A1B29",
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
          background: "#8B5CF6",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -110,
          top: -150,
          width: 520,
          height: 520,
          display: "flex",
          border: "2px solid #36D7D9",
          borderRadius: 90,
          background: "#0D2635",
          transform: "rotate(45deg)",
          opacity: 0.55,
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
            <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="12" fill="#07131F" />
              <path
                d="M8 19 32 6l24 13v26L32 58 8 45Z"
                fill="#0D2635"
                stroke="#36D7D9"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path d="M9.5 19 32 7l22.5 12L32 31Z" fill="#8B5CF6" />
              <path d="M14 18h36v9l-8 6h-5v8h9v7H18v-7h9v-8h-5l-8-6Z" fill="#07131F" />
              <path d="m32 19 7 10-5 5v9l-2 4-2-4v-9l-5-5Z" fill="#9FE870" />
              <path d="m32 3 4 4-4 4-4-4Zm-25 12 4 4-4 4-4-4Zm50 0 4 4-4 4-4-4Z" fill="#F4B84A" />
            </svg>
            <span style={{ color: "#F4B84A", fontSize: 32, fontWeight: 700, letterSpacing: 2 }}>
              ANVILPILOT
            </span>
          </div>
          <span style={{ color: "#9FE870", fontSize: 24, letterSpacing: 2 }}>
            JAVA EDITION 26.2
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ maxWidth: 930, fontSize: 72, fontWeight: 700, lineHeight: 1.04 }}>
            Minecraft Enchantment Calculator
          </span>
          <span style={{ color: "#C7D7E2", fontSize: 34 }}>
            Plan a lower-cost anvil order
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ width: 160, height: 4, display: "flex", background: "#36D7D9" }} />
          <span style={{ color: "#91AAB8", fontSize: 20, letterSpacing: 3 }}>
            PLAN / COMBINE / PRESERVE
          </span>
        </div>
      </div>
    </div>,
    size,
  );
}
