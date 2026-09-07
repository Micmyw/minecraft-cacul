import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SiteAnalytics } from "@/components/site-analytics";

describe("automatic production analytics", () => {
  beforeEach(() => {
    localStorage.clear();
    document.head.querySelector("#google-analytics-script")?.remove();
    document.head.querySelector("#microsoft-clarity-script")?.remove();
    delete (window as unknown as Record<string, unknown>).dataLayer;
    delete (window as unknown as Record<string, unknown>).gtag;
    delete (window as unknown as Record<string, unknown>).clarity;
  });

  afterEach(() => cleanup());

  it("does not load analytics away from the production hostname", async () => {
    render(<SiteAnalytics hostname="localhost" />);
    expect(document.querySelector("#google-analytics-script")).toBeNull();
    expect(document.querySelector("#microsoft-clarity-script")).toBeNull();
  });

  it("loads GA4 and Clarity automatically without rendering consent controls", async () => {
    render(<SiteAnalytics hostname="enchantmentcalculator.com" />);
    await waitFor(() => {
      expect(document.querySelector("#google-analytics-script")).not.toBeNull();
      expect(document.querySelector("#microsoft-clarity-script")).not.toBeNull();
    });
    expect(document.querySelector<HTMLScriptElement>("#google-analytics-script")?.src).toContain(
      "googletagmanager.com/gtag/js?id=G-9NRJ5W0EF6",
    );
    expect(document.querySelector<HTMLScriptElement>("#microsoft-clarity-script")?.src).toContain(
      "clarity.ms/tag/y3tct90a9r",
    );
    expect((window as Window & { dataLayer?: unknown[][] }).dataLayer).toContainEqual([
      "config",
      "G-9NRJ5W0EF6",
    ]);
    expect(screen.queryByText("Optional analytics")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Allow analytics" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Only necessary" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cookie settings" })).not.toBeInTheDocument();
  });

  it("ignores a legacy rejection and still loads both services", async () => {
    localStorage.setItem("anvilpilot:analytics-consent:v1", "rejected");
    render(<SiteAnalytics hostname="enchantmentcalculator.com" />);

    await waitFor(() => {
      expect(document.querySelector("#google-analytics-script")).not.toBeNull();
      expect(document.querySelector("#microsoft-clarity-script")).not.toBeNull();
    });
  });
});
