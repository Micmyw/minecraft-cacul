# Product analytics events

AnvilPilot's calculator events are consent-aware, production-only GA4 events. They measure the product funnel without sending a plan, its inputs, or its result steps.

## Event catalog

| Event | When it fires |
| --- | --- |
| `calculator_start` | Once per planner mode per page view, after the user first creates a meaningful Quick or Inventory draft. It does not fire for page load, hydration, LocalStorage restoration, share-link restoration, or rendering a saved result. |
| `calculation_success` | Exactly once after a Calculate action returns `success`. |
| `invalid_input` | Exactly once after a Calculate action returns `invalid-input`; it never accompanies `calculation_success`. |
| `no_legal_plan` | Exactly once after a Calculate action returns `no-legal-plan`. |
| `copy_steps` | Only after the result steps have been copied successfully. |
| `share_link` | Only after the generated share URL has been copied successfully. |
| `planner_mode_change` | After an explicit user switch between Quick and Inventory. It does not fire during initial hydration or share-link restoration. |
| `example_loaded` | Once per explicit example-button click. It includes `example_type` and can also cause the first Quick `calculator_start` of the page view. |

## Allowed parameters

Every product event is rebuilt from this fixed allowlist at dispatch time. Extra runtime properties are discarded.

| Parameter | Values | Meaning |
| --- | --- | --- |
| `planner_mode` | `quick`, `inventory` | Active planner when the action occurred. |
| `optimization_mode` | `least_total_levels`, `preserve_future_work` | Selected solver objective. |
| `result_quality` | `exact_optimal`, `best_found`, `not_applicable` | Solver quality for a completed result, or `not_applicable` before/for invalid input. |
| `result_status` | `not_calculated`, `success`, `invalid_input`, `no_legal_plan` | Result state at the time of the action. |
| `book_count_bucket` | `0`, `1-3`, `4-6`, `7-8`, `9+` | Coarse count of Quick enchantment books or Inventory sacrifices. |
| `example_type` | `maxed_sword`, `fortune_pickaxe`, `survival_boots` | Optional; present only for a valid `example_loaded` event. |

## Consent and dispatch behavior

`trackProductEvent()` returns without throwing and sends nothing unless all of these conditions are true:

1. It is running in a browser on the exact production hostname `enchantmentcalculator.com`.
2. LocalStorage already contains the `accepted` value under the consent key owned by `SiteAnalytics`.
3. `window.gtag` is available.

Rejection, missing consent, blocked LocalStorage, localhost, server rendering, and an unavailable `gtag` all suppress the event. Events are not queued, persisted, backfilled, or replayed after consent is granted.

## Privacy exclusions

Product events never include:

- target item or enchantment IDs, names, levels, or compatibility choices;
- a plan object, plan hash, book contents, or the order in which inputs were entered;
- prior-work values, per-step costs, total costs, warnings, or result steps;
- copied step text, a share URL, URL hash contents, or LocalStorage contents;
- free-form user strings or arbitrary caller-supplied properties.

Only the fixed categorical parameters documented above are eligible for dispatch.

## Verify in GA4 DebugView

1. Open the GA4 property for `G-9NRJ5W0EF6`, then open **Admin → DebugView**.
2. Enable the Google Analytics Debugger browser extension for a temporary verification session.
3. Open `https://enchantmentcalculator.com/`, choose **Allow analytics**, and reload once so the accepted choice is already present.
4. Create a meaningful Quick draft, calculate it, load one example, and successfully use Copy Steps or Copy Share Link.
5. Switch to Inventory and create a meaningful Inventory draft to verify the second `calculator_start` and `planner_mode_change`.
6. In DebugView, confirm event order and inspect each product event's parameters. Confirm that only the allowlisted categorical fields appear and that no plan-level data is present.
7. Disable the debugger extension after verification. Do not commit a permanent `debug_mode` setting.

DebugView receipt proves collection for the test session; it does not by itself prove that a report or dashboard has been configured.

## Register event-scoped custom dimensions

In **Admin → Data display → Custom definitions**, create one event-scoped custom dimension for each exact event parameter:

- `planner_mode`
- `optimization_mode`
- `result_quality`
- `result_status`
- `book_count_bucket`
- `example_type`

Use a readable display name, keep the event parameter spelling exact, and allow normal GA4 processing time before relying on the dimensions in explorations.

## Create the manual funnel exploration

In **Explore → Funnel exploration**, configure an open or closed funnel appropriate to the question being measured:

1. **Landing/session** — `session_start`, or `page_view` filtered to the landing page being evaluated.
2. **Calculator started** — `calculator_start`.
3. **Calculation completed** — an OR group containing `calculation_success`, `invalid_input`, and `no_legal_plan`.
4. **Result used** — an OR group containing `copy_steps` and `share_link`.

Add breakdowns such as `planner_mode`, `optimization_mode`, `result_quality`, and `book_count_bucket` only after the custom dimensions are available. This repository documents the manual setup; it does not create or claim a remote GA4 dashboard.
