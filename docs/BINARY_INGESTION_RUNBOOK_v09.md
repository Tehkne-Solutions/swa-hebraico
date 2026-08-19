# ALEPH 119 — Binary Ingestion Runbook v0.9

Signature: Tehkné Solutions

## Goal
Ingest the canonical 199 premium PNG production assets without letting placeholders or fallbacks count as delivered assets.

## Canonical batches

| Batch | Content | Assets | Bytes |
|---|---|---:|---:|
| B00 | 22 Master Letter Cards + official card back | 23 | 25,670,357 |
| B01 | Verse Cards 001–044 | 44 | 33,792,616 |
| B02 | Verse Cards 045–088 | 44 | 8,060,591 |
| B03 | Verse Cards 089–132 | 44 | 8,036,884 |
| B04 | Verse Cards 133–176 | 44 | 8,028,091 |
| **TOTAL** | Complete production collection | **199** | **83,588,539** |

Each PNG must be exactly 1400×2000 and must land on the deterministic production path defined by `data/cards.json` and the v0.7 manifest contract.

## Windows / PowerShell

```powershell
PowerShell -ExecutionPolicy Bypass `
  -File .\tools\ingest_asset_batch_v09.ps1 `
  -Batch B00 `
  -ZipPath "C:\path\ALEPH119_REPO_BATCH_B00_MASTER_23_v1.0.zip" `
  -Push
```

Repeat with B01–B04 after the previous batch is merged.

## macOS / Linux

```bash
bash tools/ingest_asset_batch_v09.sh \
  B00 /path/ALEPH119_REPO_BATCH_B00_MASTER_23_v1.0.zip --push
```

## Required PR sequence

1. Start from fresh `main`.
2. Ingest exactly one batch.
3. Run `node tools/validate_asset_batches_v08.mjs --batch=B0X`.
4. Commit only the canonical asset paths for that batch.
5. Push `assets/ingest-b0x` and open a PR.
6. Wait for all GitHub Actions checks to pass.
7. Merge the batch PR.
8. Start the next batch from the updated `main`.

## Final release gates

After B00–B04 are all merged:

```bash
node tools/validate_asset_batches_v08.mjs --strict
node tools/validate_asset_integrity_v06.mjs --strict
```

Production may be labeled `asset-complete` only if both commands pass and the canonical collection fingerprint matches the v0.6 integrity contract.

## Non-negotiable rules

- Fallbacks, generated placeholders and missing images never count as delivered assets.
- Do not rename cards manually after extraction.
- Do not combine multiple binary batches in one PR.
- Do not merge a binary PR with a failing batch gate.
- Do not declare 199/199 until the strict batch and cryptographic gates are green.
