import { expect, test } from "@playwright/test";

const SEO_ORIGIN = "https://enchantmentcalculator.com";
const HOME_DESCRIPTION =
  "Plan a lower-cost Minecraft anvil order, compare XP costs, and avoid Too Expensive. Free Java Edition enchantment planner with shareable steps.";

test("production metadata, social cards, manifest, and security headers are complete", async ({
  page,
  request,
}) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  expect(response.headers()["x-powered-by"]).toBeUndefined();
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response.headers()["permissions-policy"]).toBe(
    "camera=(), microphone=(), geolocation=()",
  );
  expect(response.headers()["x-frame-options"]).toBe("DENY");

  await page.goto("/");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    HOME_DESCRIPTION,
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", SEO_ORIGIN);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    "/manifest.webmanifest",
  );
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);

  const schemaText = await page.locator('script[type="application/ld+json"]').textContent();
  const schema = JSON.parse(schemaText ?? "{}") as Record<string, unknown>;
  expect(schema.softwareVersion).toBe("1.0.0");
  expect(schema.softwareRequirements).toBe("Minecraft Java Edition 26.2");

  const manifestResponse = await request.get("/manifest.webmanifest");
  expect(manifestResponse.ok()).toBe(true);
  expect(await manifestResponse.json()).toMatchObject({
    name: "AnvilPilot – Minecraft Enchantment Calculator",
    short_name: "AnvilPilot",
    start_url: "/",
    theme_color: "#151B18",
  });

  for (const selector of ['meta[property="og:image"]', 'meta[name="twitter:image"]']) {
    const imageUrl = await page.locator(selector).getAttribute("content");
    expect(imageUrl).toBeTruthy();
    const parsedImageUrl = new URL(imageUrl!);
    const imageResponse = await request.get(`${parsedImageUrl.pathname}${parsedImageUrl.search}`);
    expect(imageResponse.ok()).toBe(true);
    expect(imageResponse.headers()["content-type"]).toContain("image/png");
  }
});
