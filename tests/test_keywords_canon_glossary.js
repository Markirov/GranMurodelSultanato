/* TOUGH, FEAR, LEADER, SKIRMISHER, FLYING y ARTIFICIAL: ABILITY_LIBRARY y
 * KEYWORD_LIBRARY llevan el texto del glosario canon 1.0.2 (fuente única),
 * no resúmenes propios que contradecían el reglamento.
 * Petición de Marcos 2026-10-01 ("alinea las keywords con el glosario").
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) { console.log('  ✓ ' + msg); pass++; } else { console.log('  ✗ ' + msg); fail++; } }

const read = (f) => fs.readFileSync(path.join(ROOT, 'app', 'data', f), 'utf8');
const ability = read('02_ability_library.ts');
const keyword = read('04_keyword_library.ts');
const glossary = read('03_keyword_glossary_canon_fuente_nica_de_lo.ts');

const KEYS = ['TOUGH', 'FEAR', 'LEADER', 'SKIRMISHER', 'FLYING', 'ARTIFICIAL'];
for (const k of KEYS) {
  console.log('\n' + k);
  const canon = (glossary.match(new RegExp(String.raw`key: '${k}'[\s\S]*?text: '([^']+)'`)) || [])[1] || '';
  ok(canon.length > 0, 'glosario tiene texto');
  const ab = (ability.match(new RegExp(String.raw`'${k}': \{[\s\S]*?summary: '([^']*)'`)) || [])[1] || '';
  ok(ab === canon, 'ABILITY_LIBRARY = texto canon');
  const kw = (keyword.match(new RegExp(String.raw`'${k}':\s*'([^']*)'`)) || [])[1] || '';
  ok(kw === canon, 'KEYWORD_LIBRARY = texto canon');
}

console.log('\n' + pass + ' passed · ' + fail + ' failed');
process.exit(fail === 0 ? 0 : 1);
