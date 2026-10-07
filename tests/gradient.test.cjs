const assert = require('node:assert/strict');
const { test } = require('node:test');
const { DEFAULT_GRADIENT, buildGradientCSS, buildGradientSVG, encodeSVGForCSS, validateGradientPreset, getRGBAColor, exportGradientPNG } = require('../src/lib/gradientUtils.ts');
const preset = (patch = {}) => ({ id: 'test', name: 'Test', config: { ...DEFAULT_GRADIENT, ...patch } });

test('stored gradients reject malformed hex lengths and non-finite coordinates', () => {
  for (const color of ['#12345', '#1234567', '#nope']) {
    assert.equal(validateGradientPreset(preset({ stops: [{ id: 'a', color, position: 0 }, DEFAULT_GRADIENT.stops[1]] })), null);
  }
  assert.equal(validateGradientPreset(preset({ angle: Infinity })), null);
});
test('stored gradients normalize alpha colors and preserve unique stop identities', () => {
  const result = validateGradientPreset(preset({ stops: [{ id: 'a', color: '#f008', position: 0, opacity: 50 }, { id: 'a', color: '#fff', position: 100 }] }));
  assert.equal(result.config.stops[0].color, '#FF0000');
  assert.ok(Math.abs(result.config.stops[0].opacity - 26.6667) < 0.01);
  assert.equal(new Set(result.config.stops.map(s => s.id)).size, 2);
});
test('CSS honors radial size and never emits unsupported HSB functions', () => {
  assert.match(buildGradientCSS({ ...DEFAULT_GRADIENT, size: 'closest-side' }), /closest-side/);
  assert.doesNotMatch(buildGradientCSS(DEFAULT_GRADIENT, 'HSB'), /hsba?\(/);
});
test('CSS URI encoding survives quotes, hashes and percent signs', () => {
  const svg = '<svg width="100%"><path fill="#fff" /></svg>';
  const encoded = encodeSVGForCSS(svg);
  assert.ok(!encoded.includes('"'));
  assert.equal(decodeURIComponent(encoded), svg);
});
test('alpha hex colors combine their alpha with stop opacity', () => {
  assert.equal(getRGBAColor('#FF000080', 50), 'rgba(255, 0, 0, 0.25)');
});
test('linear PNG reaches both endpoint colors at 90 degrees', async () => {
  const original = global.document;
  let coordinates;
  const ctx = { createLinearGradient: (...args) => { coordinates = args; return { addColorStop() {} }; }, fillRect() {} };
  global.document = { createElement: () => ({ getContext: () => ctx, toBlob: callback => callback(null) }) };
  try {
    await Promise.resolve(exportGradientPNG({ ...DEFAULT_GRADIENT, type: 'linear', angle: 90 }, 200, 100)).catch(() => {});
    assert.deepEqual(coordinates.map(v => Math.round(v)), [0, 50, 200, 50]);
  } finally { global.document = original; }
});
test('conic PNG uses the same top-origin angle as CSS', async () => {
  const original = global.document;
  let angle;
  global.document = { createElement: () => ({ getContext: () => ({ createConicGradient: a => { angle = a; return { addColorStop() {} }; }, fillRect() {} }), toBlob: callback => callback(null) }) };
  try {
    await Promise.resolve(exportGradientPNG({ ...DEFAULT_GRADIENT, type: 'conic', angle: 0 }, 200, 100)).catch(() => {});
    assert.equal(angle, -Math.PI / 2);
  } finally { global.document = original; }
});
test('radial SVG uses configured geometry rather than a fixed radius', () => {
  const svg = buildGradientSVG({ ...DEFAULT_GRADIENT, size: 'closest-side' }, 200, 100);
  assert.match(svg, /gradientUnits="userSpaceOnUse"/);
  assert.match(svg, /scale\(50 50\)/);
});

test('radial PNG keeps the transform active until the rectangle is painted', async () => {
  const original = global.document;
  let transform = [1, 1, 0, 0];
  let painted;
  let rectangle;
  const ctx = {
    save() {},
    translate(x, y) { transform[2] = x; transform[3] = y; },
    scale(x, y) { transform[0] = x; transform[1] = y; },
    restore() { transform = [1, 1, 0, 0]; },
    createRadialGradient() { return { addColorStop() {} }; },
    fillRect(...args) { painted = [...transform]; rectangle = args; },
  };
  global.document = { createElement: () => ({ getContext: () => ctx, toBlob: callback => callback(null) }) };
  try {
    await assert.rejects(exportGradientPNG({ ...DEFAULT_GRADIENT, type: 'radial', size: 'closest-side' }, 200, 100), /Unable to encode PNG/);
    assert.deepEqual(painted, [50, 50, 100, 50]);
    assert.deepEqual(rectangle, [-2, -1, 4, 2]);
  } finally { global.document = original; }
});
