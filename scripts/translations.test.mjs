// スナップショットに登場する全チームが data/translations.ts にあるかを検証する。
//
// 昇格チームが入ると日本語表記が無いまま英語で表示されるが、画面を見ないと
// 気づけない。人間の記憶に頼らず、テストで落として気づけるようにする。

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findUntranslated, readTranslationKeys } from './translations.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('スナップショットの全チームに日本語表記がある', async () => {
  const snapshot = JSON.parse(await readFile(resolve(ROOT, 'data/snapshot.json'), 'utf-8'));
  const missing = findUntranslated(snapshot, await readTranslationKeys());

  assert.deepEqual(
    missing.map((m) => `${m.name} (${m.league})`),
    [],
    'data/translations.ts に追加してください'
  );
});
