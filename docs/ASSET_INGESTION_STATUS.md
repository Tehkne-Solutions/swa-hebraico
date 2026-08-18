# ALEPH 119 — Asset Ingestion Status

Signature: Tehkné Solutions

## Canonical production target

- 22 Master Letter Cards
- 176 Psalm 119 Verse Cards
- 1 official card back
- 199 production PNG assets total
- 1400×2000 px per PNG
- Aggregate SHA-256 contract: `46be1755fa3ef7fd009b1dd544e12cdbc10fe6c1f8bd4e4958950afc27326ed5`

## Current repository state

The canonical mapping and integrity contracts are already merged. Heavy premium PNG binaries are still pending repository ingestion.

Fallback rendering is allowed only as a development contingency. It is not accepted as a production asset.

## Batch plan

1. Batch 00 — official card back
2. Batch 01 — Master Letter Cards 001–006
3. Batch 02 — Master Letter Cards 007–012
4. Batch 03 — Master Letter Cards 013–018
5. Batch 04 — Master Letter Cards 019–022
6. Batch 05 — Verse Cards 001–032
7. Batch 06 — Verse Cards 033–064
8. Batch 07 — Verse Cards 065–096
9. Batch 08 — Verse Cards 097–128
10. Batch 09 — Verse Cards 129–160
11. Batch 10 — Verse Cards 161–176

## Release rule

Production is asset-complete only when:

```bash
node tools/card-manifest-v07.mjs
node tools/validate_asset_integrity_v06.mjs --strict
```

both pass and the strict integrity report confirms 199/199 canonical production assets.
