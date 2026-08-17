import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  AnalyticsSettingsButton,
  SiteAnalytics,
  analyticsConsentStorageKey,
} from "@/components/site-analytics";

describe("analytics consent", () => {
  beforeEach(() => {
    localStorage.clear();
    document.head.querySelector("#google-analytics-script")?.remove();
    document.head.querySelector("#microsoft-clarity-script")?.remove();
    delete (window as unknown as Record<string, unknown>).dataLayer;
    delete (window as unknown as Record<string, unknown>).gtag;
    delete (window as unknown as Record<string, unknown>).clarity;
  });

  afterEach(() => cleanup());

  it("does not offer or load analytics away from the production hostname", async () => {
    render(<SiteAnalytics hostname="localhost" />);
    await waitFor(() => expect(screen.queryByText("Optional analytics")).not.toBeInTheDocument());
    expect(document.querySelector("#google-analytics-script")).toBeNull();
    expect(document.querySelector("#microsoft-clarity-script")).toBeNull();
  });

  it("keeps optional analytics disabled when the visitor rejects it", async () => {
    render(<SiteAnalytics hostname="enchantmentcalculator.com" />);
    fireEvent.click(await screen.findByRole("button", { name: "Only necessary" }));

    expect(localStorage.getItem(analyticsConsentStorageKey)).toBe("rejected");
    const dataLayer = (window as Window & { dataLayer?: unknown[][] }).dataLayer;
    expect(dataLayer?.[0]).toEqual(["consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    }]);
    expect(screen.queryByText("Optional analytics")).not.toBeInTheDocument();
    expect(document.querySelector("#google-analytics-script")).toBeNull();
    expect(document.querySelector("#microsoft-clarity-script")).toBeNull();
  });

  it("loads both services only after consent and lets the visitor reopen settings", async () => {
    render(
      <>
        <AnalyticsSettingsButton hostname="enchantmentcalculator.com" />
        <SiteAnalytics hostname="enchantmentcalculator.com" />
      </>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Allow analytics" }));

    expect(localStorage.getItem(analyticsConsentStorageKey)).toBe("accepted");
    expect(document.querySelector("#google-analytics-script")).not.toBeNull();
    expect(document.querySelector("#microsoft-clarity-script")).not.toBeNull();

    fireEvent.click(await screen.findByRole("button", { name: "Cookie settings" }));
    expect(await screen.findByText("Optional analytics")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Only necessary" }));
    const clarity = (window as Window & { clarity?: { q?: unknown[][] } }).clarity;
    expect(clarity?.q).toContainEqual(["consentv2", {
      ad_Storage: "denied",
      analytics_Storage: "denied",
    }]);
    expect(clarity?.q).toContainEqual(["consent", false]);
  });
});
