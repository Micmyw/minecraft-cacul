import type { NextConfig } from "next";

const missingProductionSettings = [
  !process.env.NEXT_PUBLIC_SITE_URL && "NEXT_PUBLIC_SITE_URL (canonical and sitemap origin)",
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
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
