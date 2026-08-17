import { expect, test, type Page } from "@playwright/test";

const SAVED_PLAN_KEY = "anvilpilot:planner:v2";
const SEO_ORIGIN = "https://enchantmentcalculator.com";
const browserErrors = new WeakMap<Page, string[]>();

function planHash(state: unknown): string {
  return `#plan=v1.${Buffer.from(JSON.stringify(state)).toString("base64url")}`;
}

function inventoryState({
  targetPriorWork = 0,
  bookPriorWork = 0,
  sacrificeCount = 1,
}: {
  targetPriorWork?: number;
  bookPriorWork?: number;
  sacrificeCount?: number;
} = {}) {
  return {
    schemaVersion: 1,
    plannerMode: "inventory",
    optimizeMode: "least-total-levels",
    target: {
      id: "target",
      kind: "target",
      itemId: "sword",
      enchantments: [],
      priorWork: targetPriorWork,
    },
    sacrifices: Array.from({ length: sacrificeCount }, (_, index) => ({
      id: `book-${index + 1}`,
      kind: "book",
      itemId: null,
      enchantments: [{ enchantmentId: "mending", level: 1 }],
      priorWork: bookPriorWork,
    })),
  };
}

test.beforeEach(async ({ page, context }) => {
  browserErrors.set(page, []);
  page.on("pageerror", (error) => browserErrors.get(page)?.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.get(page)?.push(`console: ${message.text()}`);
  });
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:3000",
  });
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page) ?? []).toEqual([]);
});

test("Quick Plan calculates, focuses results, and restores a share link", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Minecraft Enchantment Calculator");
  await page.getByLabel("Target item").selectOption("sword");
  await page.getByLabel("Add enchantment").selectOption("sharpness");
  await page.getByLabel("Add enchantment").selectOption("mending");

  await page.getByRole("button", { name: "Calculate Anvil Order" }).click();
  await expect(page.getByRole("heading", { name: "Your anvil work order" })).toBeVisible();
  await expect(page.locator(".quality-badge", { hasText: "Exact Optimal" })).toBeVisible();
  await expect(page.getByText("Total Levels").locator("..").getByText("8", { exact: true })).toBeVisible();
  await expect(page.locator(".result-panel")).toBeFocused();
  await expect(page.getByText("Left prior work: 0").first()).toBeVisible();
  await expect(page.getByText("Right prior work: 0").first()).toBeVisible();
  await expect(page.getByText(/New prior work: [1-9]/u).first()).toBeVisible();

  await page.getByRole("button", { name: "Copy Steps" }).click();
  const copiedSteps = await page.evaluate(() => navigator.clipboard.readText());
  expect(copiedSteps).toContain("Left prior work: 0");
  expect(copiedSteps).toContain("Right prior work: 0");
  expect(copiedSteps).toMatch(/New prior work: [1-9]/u);

  await page.getByRole("button", { name: "Copy Share Link" }).click();
  await expect.poll(() => page.evaluate(() => window.location.hash)).toMatch(/^#plan=v1\./u);
  const sharedUrl = page.url();
  await page.goto(sharedUrl);
  await expect(page.getByLabel("Target item")).toHaveValue("sword");
  await expect(page.getByText("Sharpness", { exact: true })).toBeVisible();
  await expect(
    page.locator(".selected-enchantments").getByText("Mending", { exact: true }),
  ).toBeVisible();
});

test("Inventory Plan accepts a mixed book and warns about discarded enchantments", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Inventory Plan" }).click();
  await expect(
    page.getByText(
      "Sacrifice books must be mutually compatible unless the target item already determines which conflicting enchantment is kept.",
    ),
  ).toBeVisible();
  await page.getByLabel("Target item").selectOption("sword");
  await page.getByRole("button", { name: "+ Add enchanted book" }).click();

  const book = page.getByRole("group", { name: "Enchantments on this book" });
  await book.getByLabel("Add enchantment").selectOption("mending");
  await book.getByLabel("Add enchantment").selectOption("power");
  await page.locator("#book-1-prior-work").fill("3");
  await page.getByRole("button", { name: "Calculate Anvil Order" }).click();

  await expect(page.getByRole("heading", { name: "Your anvil work order" })).toBeVisible();
  await expect(page.getByText("Total Levels").locator("..").getByText("9", { exact: true })).toBeVisible();
  await expect(page.getByText(/Power V was not applicable to Sword and was discarded/u)).toBeVisible();
});

test("Quick and Inventory keep independent drafts across tab switches", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Target item").selectOption("sword");
  await page.getByLabel("Add enchantment").selectOption("sharpness");

  await page.getByRole("tab", { name: "Inventory Plan" }).click();
  await page.getByLabel("Target item").selectOption("pickaxe");
  await page.getByRole("button", { name: "+ Add enchanted book" }).click();
  await page
    .getByRole("group", { name: "Enchantments on this book" })
    .getByLabel("Add enchantment")
    .last()
    .selectOption("mending");
  await page.locator("#book-1-prior-work").fill("2");

  await page.getByRole("tab", { name: "Quick Plan" }).click();
  await expect(page.getByLabel("Target item")).toHaveValue("sword");
  await expect(page.getByText("Sharpness", { exact: true })).toBeVisible();

  await page.getByRole("tab", { name: "Inventory Plan" }).click();
  await expect(page.getByLabel("Target item")).toHaveValue("pickaxe");
  await expect(page.locator("#book-1-prior-work")).toHaveValue("2");
  await expect(
    page.locator(".selected-enchantments").getByText("Mending", { exact: true }),
  ).toBeVisible();
});

test("a Quick share link replaces only Quick while preserving saved Inventory", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Target item").selectOption("sword");
  await page.getByLabel("Add enchantment").selectOption("sharpness");

  await page.getByRole("tab", { name: "Inventory Plan" }).click();
  await page.getByLabel("Target item").selectOption("pickaxe");
  await page.getByRole("button", { name: "+ Add enchanted book" }).click();
  await page
    .getByRole("group", { name: "Enchantments on this book" })
    .getByLabel("Add enchantment")
    .selectOption("mending");
  await page.locator("#book-1-prior-work").fill("2");

  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), SAVED_PLAN_KEY))
    .toContain('"pickaxe"');

  const sharedQuick = {
    schemaVersion: 1,
    plannerMode: "quick",
    optimizeMode: "preserve-future-work",
    targetItemId: "bow",
    enchantments: [{ enchantmentId: "power", level: 5 }],
  };
  await page.goto(`/${planHash(sharedQuick)}`);
  await expect(page.getByLabel("Target item")).toHaveValue("bow");

  await page.getByRole("tab", { name: "Inventory Plan" }).click();
  await expect(page.getByLabel("Target item")).toHaveValue("pickaxe");
  await expect(page.locator("#book-1-prior-work")).toHaveValue("2");

  await page.reload();
  await page.getByRole("tab", { name: "Inventory Plan" }).click();
  await expect(page.getByLabel("Target item")).toHaveValue("pickaxe");
  await expect(page.locator("#book-1-prior-work")).toHaveValue("2");
});

test("validation and Too Expensive diagnostics are visible", async ({ page }) => {
  const conflict = {
    schemaVersion: 1,
    plannerMode: "quick",
    optimizeMode: "least-total-levels",
    targetItemId: "pickaxe",
    enchantments: [
      { enchantmentId: "fortune", level: 3 },
      { enchantmentId: "silk_touch", level: 1 },
    ],
  };
  await page.goto(`/${planHash(conflict)}`);
  await expect(page.locator(".inline-alert")).toContainText(
    "Fortune and Silk Touch cannot be used together",
  );
  await expect(page.getByLabel("Target item")).toHaveValue("");

  await page.goto(`/${planHash(inventoryState({ targetPriorWork: 5, bookPriorWork: 3 }))}`);
  await page.getByRole("button", { name: "Calculate Anvil Order" }).click();
  await expect(page.getByRole("heading", { name: "No Survival-legal plan" })).toBeVisible();
  await expect(page.getByText("Too Expensive", { exact: true })).toBeVisible();
  await expect(page.getByText("40 levels", { exact: true })).toBeVisible();
});

test("LocalStorage restoration and Clear Saved Plan are deterministic", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Target item").selectOption("sword");
  await page.getByLabel("Add enchantment").selectOption("mending");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), SAVED_PLAN_KEY)).toContain('"sword"');

  await page.reload();
  await expect(page.getByLabel("Target item")).toHaveValue("sword");
  await expect(page.getByText("Mending", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Clear Saved Plan" }).click();
  await expect(page.getByRole("status")).toContainText("Saved plan cleared");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), SAVED_PLAN_KEY)).toBeNull();

  await page.reload();
  await expect(page.getByLabel("Target item")).toHaveValue("");
});

test("a long Worker search can be cancelled without losing inputs", async ({ page }) => {
  await page.goto(`/${planHash(inventoryState({ sacrificeCount: 32 }))}`);
  await expect(page.getByText("32 / 32 materials")).toBeVisible();
  await page.getByRole("button", { name: "Calculate Anvil Order" }).click();
  await page.getByRole("button", { name: "Cancel calculation" }).click();
  await expect(page.getByRole("status")).toContainText("Calculation cancelled");
  await expect(page.getByLabel("Target item")).toHaveValue("sword");
});

test("layout, controls, and planner tabs work with keyboard input", async ({ page }) => {
  await page.goto("/");
  const viewportWidth = await page.evaluate(() => window.innerWidth);
  const layout = await page.locator(".result-panel").evaluate((element) => ({
    position: getComputedStyle(element).position,
    bodyWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.position).toBe(viewportWidth > 900 ? "sticky" : "static");

  const quickTarget = page.getByLabel("Target item");
  expect((await quickTarget.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  const inventoryTab = page.getByRole("tab", { name: "Inventory Plan" });
  await inventoryTab.focus();
  await page.keyboard.press("Enter");
  await expect(inventoryTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByLabel("Prior-work count").first()).toBeVisible();
});

test("server HTML, canonical metadata, sitemap, and legal robots match the SEO contract", async ({ page, request }) => {
  const response = await request.get("/");
  const html = await response.text();
  expect(html.indexOf("Minecraft Enchantment Calculator")).toBeLessThan(html.indexOf("Build your anvil plan"));
  expect(html.indexOf("Build your anvil plan")).toBeLessThan(html.indexOf("Why Enchantment Order Matters"));
  expect(html).toContain('"@type":"WebApplication"');

  await page.goto("/#plan=v1.damaged");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", SEO_ORIGIN);
  await expect(page.locator(".inline-alert")).toContainText("damaged or incomplete");

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect((sitemap.match(/<url>/gu) ?? [])).toHaveLength(2);
  expect(sitemap).toContain(`<loc>${SEO_ORIGIN}</loc>`);
  expect(sitemap).toContain(`<loc>${SEO_ORIGIN}/about</loc>`);
  for (const noindexPath of ["privacy", "terms", "disclaimer", "licenses"]) {
    expect(sitemap).not.toContain(`<loc>${SEO_ORIGIN}/${noindexPath}</loc>`);
  }

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain(`Host: ${SEO_ORIGIN}`);
  expect(robots).toContain(`Sitemap: ${SEO_ORIGIN}/sitemap.xml`);

  await page.goto("/privacy");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex, follow/u);
  await page.goto("/about");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index, follow/u);
});
