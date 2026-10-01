/* tests/test_strong_shield_combo.js
 * Validación formal de la regla canónica:
 * Escudo + STRONG + Arma Melee a 2 Manos sin CUMBERSOME (Changelog 1.0.2 p. 57, Rulebook p. 69).
 *
 * Criterios de Aceptación:
 * 1. CUANDO un modelo STRONG lleva escudo (con o sin Shield Combo) y un arma melee 2H sin CUMBERSOME
 *    ENTONCES es legal, y además puede llevar un arma a distancia 1H.
 * 2. CUANDO el arma melee 2H es CUMBERSOME ENTONCES exige Shield Combo en arma y escudo, como sin STRONG.
 * 3. CUANDO el arma 2H es a distancia ENTONCES STRONG no ayuda y exige Shield Combo.
 * 4. CUANDO un modelo STRONG lleva escudo ENTONCES solo una de sus armas puede ser 2H tratada como 1H
 *    (no puede equipar una segunda arma melee).
 * 5. CUANDO un modelo NO tiene STRONG ENTONCES cualquier combinación de arma 2H y escudo sin Shield Combo es ilegal.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'public', 'app.html'), 'utf8');
const jsFiles = fs.readdirSync(path.join(ROOT, 'public', 'js')).filter(f => f.endsWith('.js')).sort();
const js = jsFiles.map(f => fs.readFileSync(path.join(ROOT, 'public', 'js', f), 'utf8')).join('\n');
const bootIdx = js.search(/\nfunction boot\(\)/);

const dom = new JSDOM(html.replace(/<script[\s\S]*?<\/script>/g, ''), { runScripts: 'outside-only', url: 'http://localhost/' });
dom.window.eval(js.slice(0, bootIdx) + '\n;window.__X = { DATA, classifyBattlekitItem, findBattlekitItem };');
const { DATA, classifyBattlekitItem, findBattlekitItem } = dom.window.__X;

let pass = 0, fail = 0;
function ok(cond, msg) {
  if (cond) {
    console.log('  ✓ ' + msg);
    pass++;
  } else {
    console.log('  ✗ ' + msg);
    fail++;
  }
}

console.log('=== Suite: Escudo + STRONG + Armas 2H (Canon 1.0.2) ===\n');

const NA = 'new-antioch';
const naUnits = DATA.factions[NA].units;
const troop = naUnits.find(u => u.tier === 'troops' && !(u.battlekitAccess && (u.battlekitAccess.weaponLimits || u.battlekitAccess.forbidden)));
const strongTroop = Object.assign({}, troop, { keywords: (troop.keywords || []).concat('STRONG') });

const state = (item, bk, unit = strongTroop, variantId = null) => {
  const model = { uid: 'm1', unitId: unit.id, battlekit: bk };
  const wb = { factionId: NA, variantId, models: [model] };
  return classifyBattlekitItem(item, model, unit, wb);
};

const greatHammer = findBattlekitItem(NA, 'great-hammer-na'); // 2H melee, non-cumbersome, no shield combo
const tankSplitter = findBattlekitItem(NA, 'tank-splitter-prussia'); // 2H melee, CUMBERSOME, no shield combo
const shield = findBattlekitItem(NA, 'trench-shield-na'); // Shield
const pistol = findBattlekitItem(NA, 'pistol-na'); // 1H ranged
const rifle = findBattlekitItem(NA, 'bolt-rifle-na'); // 2H ranged
const sword = findBattlekitItem(NA, 'sword-na'); // 1H melee

console.log('Criterio 1: Modelo STRONG con Escudo + Arma Melee 2H sin CUMBERSOME (+ arma a distancia 1H)');
ok(state(greatHammer, ['trench-shield-na']).state === 'available',
  'Modelo STRONG con escudo puede equipar arma melee 2H sin CUMBERSOME (Great Hammer)');
ok(state(shield, ['great-hammer-na']).state === 'available',
  'Modelo STRONG con Great Hammer (2H melee) puede equipar escudo');
ok(state(pistol, ['trench-shield-na', 'great-hammer-na']).state === 'available',
  'Modelo STRONG con escudo y Great Hammer puede equipar además un arma a distancia 1H (Pistol)');

console.log('\nCriterio 2: Arma Melee 2H con CUMBERSOME exige Shield Combo incluso con STRONG');
ok(state(tankSplitter, ['trench-shield-na'], strongTroop, 'prussia').state === 'disabled',
  'Modelo STRONG con escudo NO puede equipar arma 2H CUMBERSOME sin Shield Combo (Tank-Splitter)');
ok(state(shield, ['tank-splitter-prussia'], strongTroop, 'prussia').state === 'disabled',
  'Modelo STRONG con Tank-Splitter Sword NO puede equipar escudo sin Shield Combo');

console.log('\nCriterio 3: Arma 2H a distancia exige Shield Combo (STRONG no aplica a armas de disparo)');
ok(state(rifle, ['trench-shield-na']).state === 'disabled',
  'Modelo STRONG con escudo NO puede equipar arma 2H a distancia (Bolt-Action Rifle)');
ok(state(shield, ['bolt-rifle-na']).state === 'disabled',
  'Modelo STRONG con arma 2H a distancia NO puede equipar escudo');

console.log('\nCriterio 4: Con escudo, solo 1 arma melee en total para modelo STRONG');
ok(state(sword, ['trench-shield-na', 'great-hammer-na']).state === 'disabled',
  'Modelo STRONG con escudo y Great Hammer NO puede equipar una segunda arma melee (Sword 1H)');
ok(state(greatHammer, ['trench-shield-na', 'sword-na']).state === 'disabled',
  'Modelo STRONG con escudo y Sword 1H NO puede equipar Great Hammer');

console.log('\nCriterio 5: Modelo sin STRONG (tropa ordinaria) bloqueado en 2H + Escudo');
ok(state(greatHammer, ['trench-shield-na'], troop).state === 'disabled',
  'Tropa sin STRONG con escudo tiene deshabilitado Great Hammer');
ok(state(shield, ['great-hammer-na'], troop).state === 'disabled',
  'Tropa sin STRONG con Great Hammer tiene deshabilitado escudo');

console.log(`\nResultado: ${pass} superadas · ${fail} fallidas`);
process.exit(fail === 0 ? 0 : 1);
