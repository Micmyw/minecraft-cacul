"use client";

import { useEffect } from "react";

const clarityProjectId = "y3tct90a9r";
const googleAnalyticsId = "G-9NRJ5W0EF6";
const productionHostname = "enchantmentcalculator.com";

type AnalyticsGlobals = Window & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
};

function isAnalyticsHostname(hostname: string): boolean {
  return hostname === productionHostname;
}

function loadAnalytics() {
  const analyticsWindow = window as AnalyticsGlobals;

  if (!document.querySelector("#google-analytics-script")) {
    analyticsWindow.dataLayer ??= [];
    analyticsWindow.gtag ??= (...args: unknown[]) => analyticsWindow.dataLayer?.push(args);
    analyticsWindow.gtag("js", new Date());
    analyticsWindow.gtag("config", googleAnalyticsId);

    const googleScript = document.createElement("script");
    googleScript.id = "google-analytics-script";
    googleScript.async = true;
    googleScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
    document.head.appendChild(googleScript);
  }

  if (!analyticsWindow.clarity) {
    const clarityQueue: unknown[][] = [];
    analyticsWindow.clarity = Object.assign(
      (...args: unknown[]) => {
        clarityQueue.push(args);
      },
      { q: clarityQueue },
    );
  }

  if (!document.querySelector("#microsoft-clarity-script")) {
    const clarityScript = document.createElement("script");
    clarityScript.id = "microsoft-clarity-script";
    clarityScript.async = true;
    clarityScript.src = `https://www.clarity.ms/tag/${clarityProjectId}`;
    document.head.appendChild(clarityScript);
  }
}

type AnalyticsControlProps = { hostname?: string };

export function SiteAnalytics({ hostname }: AnalyticsControlProps = {}) {
  const resolvedHostname =
    hostname ?? (typeof window === "undefined" ? "" : window.location.hostname);
  const enabledHost = isAnalyticsHostname(resolvedHostname);

  useEffect(() => {
    if (enabledHost) loadAnalytics();
  }, [enabledHost]);

  return null;
}
