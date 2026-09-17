import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gradle = readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');

const productionInputs = [
  'OPENBAND_ANDROID_KEYSTORE_PATH',
  'OPENBAND_ANDROID_KEYSTORE_PASSWORD',
  'OPENBAND_ANDROID_KEY_ALIAS',
  'OPENBAND_ANDROID_KEY_PASSWORD',
];

test('release verification is the default and production is explicit', () => {
  assert.match(
    gradle,
    /findProperty\('openband\.android\.signingMode'\) \?: 'verification'/,
  );
  assert.match(gradle, /\['verification', 'production'\] as Set/);
  assert.match(gradle, /openbandAndroidSigningMode == 'production'/);
});

test('production signing only resolves external named inputs', () => {
  for (const input of productionInputs) {
    assert.match(gradle, new RegExp(input));
  }

  assert.doesNotMatch(gradle, /\.secrets\/android-keystore/i);
  assert.doesNotMatch(gradle, /openband123/i);
  assert.doesNotMatch(gradle, /openband-android/i);
});

test('release cannot downgrade to debug signing', () => {
  const releaseBlock = gradle.match(/release \{[\s\S]*?\n        \}/)?.[0] ?? '';
  assert.ok(releaseBlock, 'release build block must exist');
  assert.doesNotMatch(releaseBlock, /signingConfigs\.debug/);
  assert.match(releaseBlock, /signingConfigs\.production/);
});

test('ordinary CI does not source Android production credentials from GitHub secrets', () => {
  for (const input of productionInputs) {
    assert.doesNotMatch(
      workflow,
      new RegExp(`${input}[^\\n]*\\$\\{\\{\\s*secrets\\.`, 'i'),
    );
  }
});

test('production signing failures are value-safe', () => {
  assert.match(gradle, /Production Android signing requires external inputs:/);
  assert.match(gradle, /Production Android signing keystore is unavailable or unreadable\./);
  assert.doesNotMatch(gradle, /println[^\n]*OPENBAND_ANDROID_/);
});
