import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const missingProductionSettings = [
  !process.env.NEXT_PUBLIC_CONTACT_EMAIL && "NEXT_PUBLIC_CONTACT_EMAIL (public contact address)",
].filter(Boolean);

if (
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PRIVATE_BUILD_WORKER !== "1" &&
  missingProductionSettings.length > 0
) {
  console.warn(
    `[AnvilPilot] Missing production configuration: ${missingProductionSettings.join(", ")}. Set these values before launch.`,
  );
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
