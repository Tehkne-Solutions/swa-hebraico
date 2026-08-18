# ALEPH 119 — Card Manifest v0.7

This sprint adds a deterministic per-card production manifest generated from `data/cards.json`.

The manifest covers:

- 22 Master Letter Cards (`L001`–`L022`)
- 176 Verse Cards (`V001`–`V176`)
- 1 official card back (`BACK`)
- canonical production paths for all 199 assets

The generator validates unique IDs, unique asset paths, complete Psalm 119 coverage and the Tehkné Solutions signature.

Generate a materialized JSON file locally with:

```bash
node tools/card-manifest-v07.mjs --write
```

Validate without writing:

```bash
node tools/card-manifest-v07.mjs
```

This manifest is the bridge between the learning catalog, the premium binary ingestion pipeline and the strict integrity gate.

Signature: Tehkné Solutions
