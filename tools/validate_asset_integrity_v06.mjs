import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const strict = process.argv.includes('--strict');
const contract = JSON.parse(fs.readFileSync('data/card-assets-integrity-v06.json','utf8'));
const fail = (m) => { console.error('FAIL:', m); process.exitCode = 1; };
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

if (contract.signature !== 'Tehkné Solutions') fail('invalid signature');
if (contract.expected.masterLetters !== 22 || contract.expected.verseCards !== 176 || contract.expected.cardBack !== 1 || contract.expected.totalAssets !== 199) fail('invalid asset counts');
if (contract.rules.pngWidth !== 1400 || contract.rules.pngHeight !== 2000) fail('invalid PNG dimensions contract');
if (!contract.rules.strictProductionRequiresExactAggregate || !contract.rules.fallbacksAreNotProductionAssets) fail('production rules must be strict');

function pngSize(buf) {
  if (buf.length < 24 || buf.subarray(1,4).toString() !== 'PNG') throw new Error('not PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}
function rowsFor(files) {
  return files.map(file => {
    const b = fs.readFileSync(file);
    const s = pngSize(b);
    if (s.width !== 1400 || s.height !== 2000) fail(`${file}: expected 1400x2000, got ${s.width}x${s.height}`);
    return `${path.basename(file)}\t${b.length}\t${sha(b)}`;
  });
}
function groupDir(key) {
  const g = contract.groups[key];
  if (!fs.existsSync(g.path)) return null;
  const files = fs.readdirSync(g.path).filter(x => x.toLowerCase().endsWith('.png')).sort().map(x => path.join(g.path,x));
  if (files.length !== g.count) return { files, complete:false };
  const rows = rowsFor(files); const bytes = files.reduce((n,f)=>n+fs.statSync(f).size,0);
  const aggregate = sha(Buffer.from(rows.join('\n')+'\n'));
  if (bytes !== g.bytes) fail(`${key}: byte total mismatch`);
  if (aggregate !== g.aggregateSha256) fail(`${key}: aggregate SHA-256 mismatch`);
  return { files, rows, complete:true };
}

const masters = groupDir('masterLetters');
const verses = groupDir('verseCards');
let back = null;
if (fs.existsSync(contract.groups.cardBack.path)) {
  const file = contract.groups.cardBack.path; const rows = rowsFor([file]); const bytes = fs.statSync(file).size;
  const aggregate = sha(Buffer.from(rows.join('\n')+'\n'));
  if (bytes !== contract.groups.cardBack.bytes) fail('cardBack: byte total mismatch');
  if (aggregate !== contract.groups.cardBack.aggregateSha256) fail('cardBack: aggregate SHA-256 mismatch');
  back = { files:[file], rows, complete:true };
}

const complete = masters?.complete && verses?.complete && back?.complete;
if (complete) {
  const rows = [...masters.rows, ...verses.rows, ...back.rows];
  const totalBytes = [...masters.files, ...verses.files, ...back.files].reduce((n,f)=>n+fs.statSync(f).size,0);
  const aggregate = sha(Buffer.from(rows.join('\n')+'\n'));
  if (totalBytes !== contract.expected.totalBytes) fail('collection byte total mismatch');
  if (aggregate !== contract.collectionAggregateSha256) fail('collection aggregate SHA-256 mismatch');
  if (!process.exitCode) console.log('PASS: exact 199-asset ALEPH 119 collection verified');
} else if (strict) {
  fail('strict mode requires all 199 canonical premium assets');
} else if (!process.exitCode) {
  console.log('PASS: integrity contract valid; premium binary ingestion still pending');
}
