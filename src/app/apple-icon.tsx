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
        background: "#07131F",
      }}
    >
      <svg width="156" height="156" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="12" fill="#07131F" />
        <path
          d="M8 19 32 6l24 13v26L32 58 8 45Z"
          fill="#0D2635"
          stroke="#36D7D9"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M9.5 19 32 7l22.5 12L32 31Z" fill="#8B5CF6" />
        <path d="M9.5 19 32 31v25L9.5 44Z" fill="#0A1B29" />
        <path d="M54.5 19 32 31v25l22.5-12Z" fill="#102D3C" />
        <path
          d="M14 18h36v9l-8 6h-5v8h9v7H18v-7h9v-8h-5l-8-6Z"
          fill="#07131F"
          stroke="#36D7D9"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="m32 19 7 10-5 5v9l-2 4-2-4v-9l-5-5Z" fill="#9FE870" />
        <path d="m32 19 3.5 10L32 34l-3.5-5Z" fill="#D9FFAD" />
        <path
          d="m32 3 4 4-4 4-4-4Zm-25 12 4 4-4 4-4-4Zm50 0 4 4-4 4-4-4Zm-25 38 4 4-4 4-4-4Z"
          fill="#F4B84A"
        />
      </svg>
    </div>,
    size,
  );
}
