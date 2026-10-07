const assert = require('node:assert/strict');
const { test } = require('node:test');
const vm = require('node:vm');
const { generateShades, generateTailwindConfig, generateCSSVariables } = require('../src/lib/paletteUtils.ts');
const { STYLE_DEFAULTS, generateStyles, exportAsReactTheme, exportAsCSSVariables, exportAsAndroidXML } = require('../src/lib/typographyUtils.ts');
const system = { name: 'Test', fontFamily: 'Inter', baseSize: 16, scaleRatio: 1.25, scaleMethod: 'Major Third', rounding: 'integer', namingConvention: 'kebab-case', responsiveScale: 'none', styles: generateStyles(16, 1.25, 'integer', STYLE_DEFAULTS) };

test('palette names containing quotes still export executable configuration', () => {
  const code = generateTailwindConfig('Client "Blue"', generateShades('#3B82F6'), [], [], [], [], [], []);
  assert.doesNotThrow(() => new vm.Script(code));
});
test('palette names cannot break CSS comments or token identifiers', () => {
  const code = generateCSSVariables(generateShades('#3B82F6'), [], [], [], [], [], [], 'Blue */ body { color: red } /*');
  assert.doesNotMatch(code, /body \{/);
});
test('React theme supports kebab-case naming', () => {
  const code = exportAsReactTheme(system).replace("import React from 'react';", '').replaceAll('export const ', 'const ');
  assert.doesNotThrow(() => new vm.Script(code));
});
test('fluid typography exports responsive CSS', () => {
  const code = exportAsCSSVariables({ ...system, responsiveScale: 'fluid' });
  assert.match(code, /clamp\(/);
});
test('renamed typography styles cannot break XML comments', () => {
  const code = exportAsAndroidXML({ ...system, styles: [{ ...system.styles[0], name: 'Hero --> <bad>' }] });
  assert.doesNotMatch(code, /--> <bad>/);
});

test('stepped web exports provide mobile sizes instead of silently exporting desktop only', () => {
  const { exportAsSCSS, exportAsTailwindConfig, exportAsReactTheme } = require('../src/lib/typographyUtils.ts');
  const stepped = { ...system, responsiveScale: 'stepped' };
  assert.match(exportAsSCSS(stepped), /@media/);
  assert.match(exportAsTailwindConfig(stepped), /@media/);
  assert.match(exportAsReactTheme(stepped), /matchMedia/);
});

test('downloaded React themes compile with strict TypeScript in every responsive mode', () => {
  const ts = require('typescript');
  const path = require('node:path');
  for (const responsiveScale of ['none', 'fluid', 'stepped']) {
    const file = path.join(process.cwd(), 'tests', '__generated-theme.ts');
    const source = exportAsReactTheme({ ...system, responsiveScale });
    const options = { strict: true, noEmit: true, skipLibCheck: true, esModuleInterop: true, target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS };
    const host = ts.createCompilerHost(options);
    const getSourceFile = host.getSourceFile.bind(host);
    host.getSourceFile = (name, ...args) => name === file ? ts.createSourceFile(file, source, ts.ScriptTarget.ES2020, true) : getSourceFile(name, ...args);
    const program = ts.createProgram([file], options, host);
    const diagnostics = ts.getPreEmitDiagnostics(program).map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
    assert.deepEqual(diagnostics, [], responsiveScale);
  }
});

test('contrast decisions retain precision at WCAG thresholds', () => {
  const { getContrastLabel } = require('../src/lib/paletteUtils.ts');
  const base = generateShades('#CD4C2D').find(shade => shade.level === '500-Base');
  assert.ok(base.contrastOnWhite < 4.5);
  assert.notEqual(getContrastLabel(base.contrastOnWhite).score, 'AA');
});
