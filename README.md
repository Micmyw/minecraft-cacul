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

## Deployment

The app is designed for a standard Vercel Next.js deployment. Configure both
variables before the production build:

```text
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
NEXT_PUBLIC_CONTACT_EMAIL=you@example.com
```

`NEXT_PUBLIC_SITE_URL` must be the canonical origin without a trailing path.
If either value is missing during a production build, the build prints one
configuration warning; the UI never emits an empty `mailto:` link.
