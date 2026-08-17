"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const clarityProjectId = "y3tct90a9r";
const googleAnalyticsId = "G-9NRJ5W0EF6";
const productionHostname = "enchantmentcalculator.com";
const consentStorageKey = "anvilpilot:analytics-consent:v1";
const openConsentEvent = "anvilpilot:open-analytics-consent";

type ConsentChoice = "accepted" | "rejected";
type AnalyticsGlobals = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
};

function isAnalyticsHostname(hostname: string): boolean {
  return hostname === productionHostname;
}

function setGoogleConsent(granted: boolean, command: "default" | "update" = "update") {
  const analyticsWindow = window as AnalyticsGlobals;
  analyticsWindow.dataLayer ??= [];
  analyticsWindow.gtag ??= (...args: unknown[]) => analyticsWindow.dataLayer?.push(args);
  analyticsWindow.gtag("consent", command, {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: granted ? "granted" : "denied",
  });
}

function loadAnalytics() {
  const analyticsWindow = window as AnalyticsGlobals;
  setGoogleConsent(true);

  if (!document.querySelector("#google-analytics-script")) {
    analyticsWindow.gtag?.("js", new Date());
    analyticsWindow.gtag?.("config", googleAnalyticsId);
    const googleScript = document.createElement("script");
    googleScript.id = "google-analytics-script";
    googleScript.async = true;
    googleScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
    document.head.appendChild(googleScript);
  }

  if (!analyticsWindow.clarity) {
    const clarityQueue: unknown[][] = [];
    const clarity = Object.assign(
      (...args: unknown[]) => {
        clarityQueue.push(args);
      },
      { q: clarityQueue },
    );
    analyticsWindow.clarity = clarity;
  }
  analyticsWindow.clarity("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: "granted",
  });

  if (!document.querySelector("#microsoft-clarity-script")) {
    const clarityScript = document.createElement("script");
    clarityScript.id = "microsoft-clarity-script";
    clarityScript.async = true;
    clarityScript.src = `https://www.clarity.ms/tag/${clarityProjectId}`;
    document.head.appendChild(clarityScript);
  }
}

function revokeAnalytics() {
  const analyticsWindow = window as AnalyticsGlobals;
  setGoogleConsent(false);
  analyticsWindow.clarity?.("consentv2", {
    ad_Storage: "denied",
    analytics_Storage: "denied",
  });
  analyticsWindow.clarity?.("consent", false);

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || !/^(_ga|_clck|_clsk)/u.test(name)) continue;
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=.${productionHostname}; SameSite=Lax`;
  }
}

function readConsent(): ConsentChoice | null {
  try {
    const stored = localStorage.getItem(consentStorageKey);
    return stored === "accepted" || stored === "rejected" ? stored : null;
  } catch {
    return null;
  }
}

function saveConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(consentStorageKey, choice);
  } catch {
    // Privacy modes may disable storage. The in-memory choice still applies to this page view.
  }
}

type AnalyticsControlProps = { hostname?: string };

export function SiteAnalytics({ hostname }: AnalyticsControlProps = {}) {
  const [visible, setVisible] = useState(false);
  const resolvedHostname = hostname ?? (typeof window === "undefined" ? "" : window.location.hostname);
  const enabledHost = isAnalyticsHostname(resolvedHostname);

  useEffect(() => {
    if (!enabledHost) return;

    setGoogleConsent(false, "default");
    const stored = readConsent();
    if (stored === "accepted") loadAnalytics();
    const showTimer = stored === null ? window.setTimeout(() => setVisible(true), 0) : null;

    const openSettings = () => setVisible(true);
    window.addEventListener(openConsentEvent, openSettings);
    return () => {
      if (showTimer !== null) window.clearTimeout(showTimer);
      window.removeEventListener(openConsentEvent, openSettings);
    };
  }, [enabledHost]);

  if (!enabledHost || !visible) return null;

  const choose = (choice: ConsentChoice) => {
    saveConsent(choice);
    if (choice === "accepted") loadAnalytics();
    else revokeAnalytics();
    setVisible(false);
  };

  return (
    <section className="consent-banner" role="region" aria-labelledby="analytics-consent-title">
      <div>
        <span className="section-kicker">PRIVACY CHOICE</span>
        <h2 id="analytics-consent-title">Optional analytics</h2>
        <p>
          Allow Google Analytics and Microsoft Clarity to help improve AnvilPilot. The calculator
          stays local and its interface is masked in recordings. Read the <Link href="/privacy">Privacy notice</Link>.
        </p>
      </div>
      <div className="consent-actions">
        <button type="button" className="secondary-button" onClick={() => choose("rejected")}>
          Only necessary
        </button>
        <button type="button" onClick={() => choose("accepted")}>
          Allow analytics
        </button>
      </div>
    </section>
  );
}

export function AnalyticsSettingsButton({ hostname }: AnalyticsControlProps = {}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(
      () => setVisible(isAnalyticsHostname(hostname ?? window.location.hostname)),
      0,
    );
    return () => window.clearTimeout(showTimer);
  }, [hostname]);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="footer-link-button"
      onClick={() => window.dispatchEvent(new Event(openConsentEvent))}
    >
      Cookie settings
    </button>
  );
}

export const analyticsConsentStorageKey = consentStorageKey;
