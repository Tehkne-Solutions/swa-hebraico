import fs from 'node:fs';
import path from 'node:path';

const strict = process.argv.includes('--strict');
const sourceArg = process.argv.find((x)=>x.startsWith('--source='));
const install = process.argv.includes('--install');
const catalog = JSON.parse(fs.readFileSync('data/cards.json','utf8'));

const expected=[];
for (const letter of catalog.letters) {
  expected.push({kind:'master',id:`L${letter.id}`,path:letter.masterAsset});
  letter.verseAssets.forEach((p,i)=>expected.push({kind:'verse',id:`V${letter.startVerse+i}`,path:p}));
}
if(expected.length!==198) throw new Error(`catalog expected 198 cards, got ${expected.length}`);
if(new Set(expected.map(x=>x.path)).size!==198) throw new Error('duplicate asset paths in catalog');

function pngSize(file){
  const b=fs.readFileSync(file);
  if(b.length<24 || b.toString('hex',0,8)!=='89504e470d0a1a0a') throw new Error(`not PNG: ${file}`);
  return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
}
function walk(dir,out=[]){
  if(!fs.existsSync(dir)) return out;
  for(const e of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,e.name); e.isDirectory()?walk(p,out):out.push(p);
  }
  return out;
}

if(install){
  if(!sourceArg) throw new Error('use --source=/path/to/ALEPH119_COMPLETE_COLLECTION_198_v1.0 with --install');
  const source=sourceArg.slice('--source='.length);
  const files=walk(source).filter(p=>p.toLowerCase().endsWith('.png'));
  const byBase=new Map();
  for(const f of files){ const b=path.basename(f); if(!byBase.has(b)) byBase.set(b,f); }
  let copied=0;
  for(const item of expected){
    const src=byBase.get(path.basename(item.path));
    if(!src) continue;
    const size=pngSize(src);
    if(size.width!==1400 || size.height!==2000) throw new Error(`unexpected dimensions ${size.width}x${size.height}: ${src}`);
    fs.mkdirSync(path.dirname(item.path),{recursive:true});
    fs.copyFileSync(src,item.path); copied++;
  }
  console.log(`INSTALL: copied ${copied}/198 premium card assets`);
}

const present=[]; const missing=[]; const invalid=[];
for(const item of expected){
  if(!fs.existsSync(item.path)){ missing.push(item); continue; }
  try{
    const size=pngSize(item.path);
    if(size.width!==1400 || size.height!==2000) invalid.push({...item,...size});
    else present.push(item);
  } catch(e){ invalid.push({...item,error:e.message}); }
}
const back='assets/card_back.png';
const backPresent=fs.existsSync(back);
console.log(`ASSET STATUS: ${present.length}/198 premium cards present; ${missing.length} missing; ${invalid.length} invalid; card_back=${backPresent?'present':'missing'}`);
if(invalid.length){ console.error(invalid); process.exitCode=1; }
if(strict && (missing.length || !backPresent)){
  console.error('STRICT FAIL: premium asset collection is incomplete');
  process.exitCode=1;
}
if(!process.exitCode) console.log(strict?'PASS: strict premium asset gate':'PASS: asset catalog/ingestion pipeline valid');
