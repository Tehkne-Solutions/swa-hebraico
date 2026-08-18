# ALEPH 119 — Premium Asset Batches v0.8

The canonical production collection contains 199 binary PNG assets:

- 22 Master Letter Cards;
- 176 Psalm 119 Verse Cards;
- 1 official card back.

All production binaries are 1400×2000 PNG and the full collection is locked by the v0.6 integrity contract.

## Controlled batches

| Batch | Scope | Assets | Exact bytes |
|---|---|---:|---:|
| B00 | 22 Master Letter Cards + card back | 23 | 25,670,357 |
| B01 | Verse Cards 001–044 | 44 | 33,792,616 |
| B02 | Verse Cards 045–088 | 44 | 8,060,591 |
| B03 | Verse Cards 089–132 | 44 | 8,036,884 |
| B04 | Verse Cards 133–176 | 44 | 8,028,091 |

Total: **199 assets / 83,588,539 bytes**.

## Batch validation

```bash
node tools/validate_asset_batches_v08.mjs
node tools/validate_asset_batches_v08.mjs --batch=B00
node tools/validate_asset_batches_v08.mjs --strict
```

A named batch command fails unless that specific batch is complete and valid. The normal CI command remains informative while binary rollout is in progress. `--strict` requires all five batches.

After all five batches are present, production must also pass:

```bash
node tools/validate_asset_integrity_v06.mjs --strict
```

The v0.6 command is the cryptographic release gate. A fallback card, placeholder, renamed substitute, resized image or visually similar reconstruction is not considered a production asset.

## Merge policy

Each binary batch must be introduced through its own PR. A batch PR may merge only when its named batch validator passes. Production is not `asset-complete` until B00–B04 and the v0.6 strict integrity gate are green.

Signature: **Tehkné Solutions**
