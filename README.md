# AnvilPilot

AnvilPilot is a browser-only Minecraft Java Edition 26.2 enchantment-order
calculator. It plans enchanted-book combinations, compares them with the input
order, and labels exhaustive results separately from deterministic heuristic
results. There is no API, account, database, or runtime data download.

## Requirements

- Node.js 24.x
- pnpm 11.5.2 (the version pinned by `packageManager`)

## Run locally

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:3000>. A production build can be run with:

```bash
pnpm build
pnpm start
```

## Test and verify

Install the Chromium browser used by Playwright once on a new machine:

```bash
pnpm exec playwright install chromium
```

Then run the same checks used by CI:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm build:cloudflare
```

`pnpm test` runs the Vitest unit and integration suites. `pnpm test:e2e` runs
the Playwright suite in desktop Chromium and a Pixel 7 mobile profile.

## Data and solver provenance

- Supported ruleset: Minecraft Java Edition 26.2 release
- Data verified: 2026-08-17
- Algorithm reference: `iamcal/enchant-order`
- Pinned upstream commit: `380c9f8639e48c6b1a668b68b6f3228753fe00fe`
- Upstream MIT license: `licenses/iamcal-enchant-order-MIT.txt`
- Attribution and modification scope: `THIRD_PARTY_NOTICES.md`

Plans with up to eight sacrifice books use the exhaustive exact solver. Plans
with nine through 32 sacrifice books use the deterministic bounded heuristic.
V1 accepts one target item and enchanted books; equipment sacrifices, repairs,
renaming, durability merging, Bedrock, mods, datapacks, and snapshots are out
of scope.

## SEO validation release scope

The first post-launch validation release adds:

- consent-aware calculator funnel events, documented in
  [`docs/analytics-events.md`](docs/analytics-events.md);
- three solver-verified Quick Plan examples: Maxed Sword, Fortune Pickaxe, and
  Survival Boots;
- a local, keyboard-operable enchantment search control with no third-party UI
  dependency or remote search;
- substantive guides at `/minecraft-prior-work-penalty` and
  `/minecraft-anvil-too-expensive`, backed by solver-verified worked examples;
- desktop Chromium, Pixel 7, 320px overflow, guide SEO, and four-URL sitemap
  release coverage.

This release does not change the core solver, the Java Edition 26.2 catalog,
the eight-book Exact Optimal / nine-or-more Best Found boundary, or the
homepage title and H1. It also does not add indexable preset or item pages.

## Deployment

### Vercel

The app is designed for a standard Vercel Next.js deployment. Its canonical
production origin is fixed at `https://enchantmentcalculator.com`. Configure
the public contact address before the production build:

```text
NEXT_PUBLIC_CONTACT_EMAIL=you@example.com
```

If the contact address is missing during a production build, the build prints
one configuration warning; the UI never emits an empty `mailto:` link.

### Cloudflare Workers

Cloudflare deployment uses OpenNext and does not replace the standard Next.js
build used by local development, CI, or Vercel. To build and preview the Worker
locally:

```bash
pnpm build:cloudflare
pnpm preview:cloudflare
```

For a Git-connected Cloudflare Workers project, use these dashboard values:

```text
Build command: pnpm run build:cloudflare
Deploy command: pnpm exec opennextjs-cloudflare deploy
```

Set the following build variables before deploying:

```text
NODE_VERSION=24
NEXT_PUBLIC_CONTACT_EMAIL=you@example.com
```

For command-line deployment after `wrangler login`, run
`pnpm deploy:cloudflare`. Use `pnpm upload:cloudflare` when you want to create a
Worker version without immediately deploying it.

OpenNext's local build tooling is not fully compatible with native Windows.
Run the Cloudflare-specific commands in WSL/Linux, or let the repository's
Linux GitHub Actions workflow and Cloudflare build system run them. Regular
`pnpm dev`, `pnpm build`, and `pnpm start` continue to work on Windows.
