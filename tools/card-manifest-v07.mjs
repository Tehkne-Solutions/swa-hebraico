import fs from 'node:fs';

const cards = JSON.parse(fs.readFileSync('data/cards.json', 'utf8'));
const outPath = 'data/card-manifest-v07.generated.json';

const slug = (name) => name.toLowerCase();
const manifest = {
  version: '0.7.0',
  signature: 'Tehkné Solutions',
  counts: {
    masterLetters: 22,
    verseCards: 176,
    primaryCards: 198,
    cardBack: 1,
    productionAssets: 199
  },
  cardBack: {
    id: 'BACK',
    type: 'card-back',
    assetPath: 'assets/card_back.png',
    required: true
  },
  cards: []
};

for (const letter of cards.letters) {
  const masterId = `L${String(letter.id).padStart(3, '0')}`;
  manifest.cards.push({
    id: masterId,
    type: 'master-letter',
    order: letter.id,
    letter: letter.name,
    hebrew: letter.hebrew,
    psalm119Range: `${letter.startVerse}-${letter.endVerse}`,
    assetPath: `assets/cards/master/${String(letter.id).padStart(3, '0')}_${slug(letter.name)}.png`,
    required: true
  });

  for (let verse = letter.startVerse; verse <= letter.endVerse; verse += 1) {
    manifest.cards.push({
      id: `V${String(verse).padStart(3, '0')}`,
      type: 'verse',
      order: verse,
      letterId: masterId,
      letter: letter.name,
      hebrew: letter.hebrew,
      psalm119Verse: verse,
      assetPath: `assets/cards/verses/${String(verse).padStart(3, '0')}.png`,
      required: true
    });
  }
}

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};

const ids = new Set(manifest.cards.map((card) => card.id));
const paths = new Set(manifest.cards.map((card) => card.assetPath));
const masters = manifest.cards.filter((card) => card.type === 'master-letter');
const verses = manifest.cards.filter((card) => card.type === 'verse');

if (cards.letters.length !== 22) fail('data/cards.json must contain 22 letters');
if (manifest.cards.length !== 198) fail(`expected 198 primary cards, found ${manifest.cards.length}`);
if (masters.length !== 22) fail(`expected 22 master cards, found ${masters.length}`);
if (verses.length !== 176) fail(`expected 176 verse cards, found ${verses.length}`);
if (ids.size !== 198) fail('card IDs must be unique');
if (paths.size !== 198) fail('asset paths must be unique');
if (verses[0]?.psalm119Verse !== 1 || verses.at(-1)?.psalm119Verse !== 176) fail('verse coverage must be 1..176');
if (manifest.signature !== 'Tehkné Solutions') fail('invalid signature');

for (let i = 1; i <= 176; i += 1) {
  if (!ids.has(`V${String(i).padStart(3, '0')}`)) fail(`missing verse card V${String(i).padStart(3, '0')}`);
}
for (let i = 1; i <= 22; i += 1) {
  if (!ids.has(`L${String(i).padStart(3, '0')}`)) fail(`missing master card L${String(i).padStart(3, '0')}`);
}

if (!process.exitCode) {
  if (process.argv.includes('--write')) {
    fs.writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`WROTE: ${outPath}`);
  }
  console.log('PASS: 22 masters + 176 verses + 1 back = 199 production assets mapped');
}
