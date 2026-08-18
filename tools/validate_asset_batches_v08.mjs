import fs from 'node:fs';
import path from 'node:path';

const config = JSON.parse(fs.readFileSync('data/asset-batches-v08.json','utf8'));
const cards = JSON.parse(fs.readFileSync('data/cards.json','utf8'));
const strict = process.argv.includes('--strict');
const only = process.argv.find(x=>x.startsWith('--batch='))?.split('=')[1] ?? null;
const fail = m => { console.error('FAIL:',m); process.exitCode = 1; };
const ok = m => console.log('PASS:',m);
const info = m => console.log('INFO:',m);

if (config.signature !== 'Tehkné Solutions') fail('invalid signature');
if (config.collection.productionAssets !== 199) fail('expected 199 production assets');
if (config.collection.masterLetterCards !== 22) fail('expected 22 master cards');
if (config.collection.verseCards !== 176) fail('expected 176 verse cards');
if (config.collection.cardBack !== 1) fail('expected one card back');
if (config.batches.length !== 5) fail('expected five controlled batches');

const assetPaths = {
  masters: cards.letters.map(x=>x.masterAsset),
  verses: cards.letters.flatMap(x=>x.verseAssets),
  back: ['assets/card_back.png']
};
if (new Set(assetPaths.masters).size !== 22) fail('master paths are not unique');
if (new Set(assetPaths.verses).size !== 176) fail('verse paths are not unique');

function pngDimensions(file) {
  const b = fs.readFileSync(file);
  if (b.length < 24 || b.toString('hex',0,8) !== '89504e470d0a1a0a') return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20), bytes: b.length };
}
function checkFiles(paths) {
  let present=0, bytes=0, invalid=[];
  for (const p of paths) {
    if (!fs.existsSync(p)) continue;
    present++;
    const meta=pngDimensions(p);
    if (!meta || meta.width!==config.rules.expectedPngWidth || meta.height!==config.rules.expectedPngHeight) invalid.push(p);
    else bytes += meta.bytes;
  }
  return {present,bytes,invalid};
}
function pathsFor(batch) {
  if (batch.kind==='master') return [...assetPaths.masters,...assetPaths.back];
  const [a,b]=batch.verseRange;
  return assetPaths.verses.slice(a-1,b);
}

for (const batch of config.batches) {
  if (only && only!==batch.id) continue;
  const expected=pathsFor(batch);
  if (expected.length!==batch.assets) fail(`${batch.id}: manifest count mismatch ${expected.length}/${batch.assets}`);
  const r=checkFiles(expected);
  if (r.invalid.length) fail(`${batch.id}: invalid PNG(s): ${r.invalid.join(', ')}`);
  if (r.present===batch.assets) {
    if (r.bytes!==batch.bytes) fail(`${batch.id}: byte count mismatch ${r.bytes}/${batch.bytes}`);
    else ok(`${batch.id} complete: ${r.present}/${batch.assets} assets, ${r.bytes} bytes`);
  } else {
    const msg=`${batch.id} pending: ${r.present}/${batch.assets} assets present`;
    if (strict || only) fail(msg); else info(msg);
  }
}

if (strict) {
  const all=[...assetPaths.masters,...assetPaths.verses,...assetPaths.back];
  const r=checkFiles(all);
  if (r.present!==199) fail(`strict collection incomplete: ${r.present}/199`);
  if (r.bytes!==config.collection.totalBytes) fail(`strict byte count mismatch: ${r.bytes}/${config.collection.totalBytes}`);
  if (!process.exitCode) ok('all five batches complete; run v0.6 cryptographic strict gate next');
}

if (!process.exitCode && !strict && !only) ok('asset batch controller contract valid');
