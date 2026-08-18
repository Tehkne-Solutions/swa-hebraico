import fs from 'node:fs';

const app = fs.readFileSync('app.js','utf8');
const index = fs.readFileSync('index.html','utf8');
const css = fs.readFileSync('training.css','utf8');

const required = [
  "aleph119-progress-v03",
  "speechSynthesis",
  "he-IL",
  "scoreTrace",
  "fallbackCard",
  "nameToGlyph",
  "glyphToName",
  "scheduleReview"
];
for (const token of required) {
  if (!app.includes(token)) throw new Error(`runtime token missing: ${token}`);
}
if (!index.includes('training.css')) throw new Error('training.css is not linked');
if (!css.includes('.fallback-card') || !css.includes('.trace-score')) throw new Error('training states missing');
console.log('ALEPH 119 runtime v0.3 contract OK');
