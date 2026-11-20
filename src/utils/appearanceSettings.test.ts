import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_LIGHT_BG_CLASSES,
  LIGHT_BG_PRESETS,
  resolveLightBgPreset,
} from './appearanceSettings';

test('LIGHT_BG_PRESETS provides default white/off-white plus multiple distinct light colors', () => {
  assert.ok(LIGHT_BG_PRESETS.length >= 6);
  const ids = new Set(LIGHT_BG_PRESETS.map((p) => p.id));
  const hexes = new Set(LIGHT_BG_PRESETS.map((p) => p.hex));
  assert.equal(ids.size, LIGHT_BG_PRESETS.length);
  assert.equal(hexes.size, LIGHT_BG_PRESETS.length);
  assert.equal(LIGHT_BG_PRESETS[0].id, 'default');
  assert.equal(ALL_LIGHT_BG_CLASSES.length, LIGHT_BG_PRESETS.length);
});

test('resolveLightBgPreset returns matching preset or safely falls back to default', () => {
  assert.equal(resolveLightBgPreset('ice_blue').id, 'ice_blue');
  assert.equal(resolveLightBgPreset('warm_ivory').appBgClass, 'bg-[#fbf4e4]');
  assert.equal(resolveLightBgPreset('unknown_theme').id, 'default');
  assert.equal(resolveLightBgPreset(undefined).id, 'default');
  assert.equal(resolveLightBgPreset(null).id, 'default');
});
