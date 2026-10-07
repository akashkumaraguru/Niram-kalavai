const assert = require('node:assert/strict');
const { test } = require('node:test');
const { readStoredList } = require('../src/lib/validation.ts');
const { validatePalette, validateTypographyPreset, restoreStyleDefinitions } = require('../src/lib/presetStorage.ts');
const { generateShades } = require('../src/lib/paletteUtils.ts');
const { STYLE_DEFAULTS, generateStyles } = require('../src/lib/typographyUtils.ts');

test('invalid saved data cannot populate the palette or typography galleries', () => {
  for (const invalid of [null, [], 'bad', 7, {}, { name: 'Bad', baseColor: '#nope', shades: [null] }]) {
    assert.equal(validatePalette(invalid), null);
    assert.equal(validateTypographyPreset(invalid), null);
  }
});
test('legacy palettes restore missing status scales safely', () => {
  const result = validatePalette({ name: 'Legacy', baseColor: '#123456', shades: generateShades('#123456') });
  assert.equal(result.info.length, 11);
  assert.equal(result.secondaryColor, '#8B5CF6');
  assert.equal(result.lightnessModifier, 0);
});
test('a loaded override can reset to original default metrics', () => {
  const preset = { name: 'Test', fontFamily: 'Inter', baseSize: 16, scaleRatio: 1.25, styles: generateStyles(16, 1.25, 'integer', STYLE_DEFAULTS, { h1: { fontWeight: 300, lineHeight: 2, letterSpacing: 0.1 } }) };
  const loaded = validateTypographyPreset(preset);
  const reset = generateStyles(16, 1.25, 'integer', restoreStyleDefinitions(loaded))[0];
  assert.equal(reset.fontWeight, 800);
  assert.equal(reset.lineHeight, 1.15);
  assert.equal(reset.letterSpacing, -0.025);
});
test('saved custom definitions retain their original baseline', () => {
  const defs = [{ id: 'h7', name: 'Custom Hero', step: 7, weight: 500, lh: 1.7, ls: 0.03, isCustom: true }];
  const preset = validateTypographyPreset({ name: 'Custom', fontFamily: 'Inter', baseSize: 16, scaleRatio: 1.25, styleDefs: defs, styles: generateStyles(16, 1.25, 'integer', defs, { h7: { lineHeight: 2 } }) });
  assert.equal(restoreStyleDefinitions(preset)[0].lh, 1.7);
  assert.equal(restoreStyleDefinitions(preset)[0].name, 'Custom Hero');
});
test('stored lists handle broken JSON, non-arrays and unavailable storage', () => {
  const original = global.localStorage;
  try {
    for (const raw of ['broken', '{}', 'null', '[null, {}]']) {
      global.localStorage = { getItem: () => raw };
      assert.deepEqual(readStoredList('test', validatePalette), []);
    }
    global.localStorage = { getItem: () => { throw new Error('blocked'); } };
    assert.deepEqual(readStoredList('test', validatePalette), []);
  } finally { global.localStorage = original; }
});
