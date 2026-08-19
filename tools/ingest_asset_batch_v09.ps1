param(
  [Parameter(Mandatory=$true)][ValidateSet('B00','B01','B02','B03','B04')][string]$Batch,
  [Parameter(Mandatory=$true)][string]$ZipPath,
  [string]$BranchPrefix = 'assets/ingest',
  [switch]$Push
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $ZipPath)) { throw "ZIP not found: $ZipPath" }
if (-not (Test-Path '.git')) { throw 'Run from the swa-hebraico repository root.' }

$branch = "$BranchPrefix-$($Batch.ToLower())"
$temp = Join-Path ([System.IO.Path]::GetTempPath()) ("aleph119-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $temp | Out-Null

try {
  Expand-Archive -LiteralPath $ZipPath -DestinationPath $temp -Force

  $assets = Join-Path $temp 'assets'
  if (-not (Test-Path $assets)) { throw 'Batch ZIP must contain an assets/ directory at its root.' }

  git fetch origin
  git switch main
  git pull --ff-only origin main

  $exists = git branch --list $branch
  if ($exists) { git switch $branch } else { git switch -c $branch }

  Copy-Item -Path (Join-Path $assets '*') -Destination 'assets' -Recurse -Force

  node tools/validate_asset_batches_v08.mjs --batch=$Batch
  if ($LASTEXITCODE -ne 0) { throw "Batch gate failed for $Batch" }

  git add assets
  if (git diff --cached --quiet) { Write-Host "No asset changes detected for $Batch"; exit 0 }

  git commit -m "assets: ingest ALEPH 119 premium batch $Batch"

  if ($Push) {
    git push -u origin $branch
    Write-Host "Pushed $branch. Open a PR to main and wait for gates before merging."
  } else {
    Write-Host "Committed locally on $branch. Re-run with -Push to publish."
  }
}
finally {
  if (Test-Path $temp) { Remove-Item -Path $temp -Recurse -Force }
}
