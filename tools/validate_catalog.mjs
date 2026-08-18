import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync(new URL('../data/cards.json', import.meta.url), 'utf8'));
const letters = data.letters ?? [];
const errors = [];

if (letters.length !== 22) errors.push(`expected 22 letters, got ${letters.length}`);

const verseNumbers = [];
const masterAssets = new Set();
const verseAssets = new Set();

for (const [index, letter] of letters.entries()) {
  const expectedId = index + 1;
  const expectedStart = index * 8 + 1;
  const expectedEnd = expectedStart + 7;

  if (letter.id !== expectedId) errors.push(`${letter.name}: expected id ${expectedId}, got ${letter.id}`);
  if (letter.startVerse !== expectedStart || letter.endVerse !== expectedEnd) {
    errors.push(`${letter.name}: expected verses ${expectedStart}-${expectedEnd}, got ${letter.startVerse}-${letter.endVerse}`);
  }
  if (!letter.masterAsset) errors.push(`${letter.name}: missing masterAsset`);
  if (masterAssets.has(letter.masterAsset)) errors.push(`${letter.name}: duplicate masterAsset ${letter.masterAsset}`);
  masterAssets.add(letter.masterAsset);

  if (!Array.isArray(letter.verseAssets) || letter.verseAssets.length !== 8) {
    errors.push(`${letter.name}: expected 8 verseAssets, got ${letter.verseAssets?.length ?? 0}`);
    continue;
  }

  letter.verseAssets.forEach((asset, offset) => {
    const verse = expectedStart + offset;
    verseNumbers.push(verse);
    if (!asset.includes(`VERSE_${String(verse).padStart(3, '0')}.png`)) {
      errors.push(`${letter.name}: verse ${verse} path mismatch: ${asset}`);
    }
    if (verseAssets.has(asset)) errors.push(`${letter.name}: duplicate verse asset ${asset}`);
    verseAssets.add(asset);
  });
}

const expectedVerses = Array.from({ length: 176 }, (_, i) => i + 1);
if (JSON.stringify(verseNumbers) !== JSON.stringify(expectedVerses)) {
  errors.push('verse sequence is not exactly Psalm 119:1-176');
}
if (masterAssets.size !== 22) errors.push(`expected 22 unique master assets, got ${masterAssets.size}`);
if (verseAssets.size !== 176) errors.push(`expected 176 unique verse assets, got ${verseAssets.size}`);

if (errors.length) {
  console.error('ALEPH119 CATALOG FAIL');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

console.log('ALEPH119 CATALOG PASS');
console.log(`letters=${letters.length} masters=${masterAssets.size} verses=${verseAssets.size} totalCards=${masterAssets.size + verseAssets.size}`);
