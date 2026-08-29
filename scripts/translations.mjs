// data/translations.ts をスクリプトから読むためのユーティリティ。
//
// TypeScript をそのまま import できないため、単純なオブジェクトリテラルを
// 正規表現で読み取る。翻訳表はキーと値が文字列だけの平坦な構造なので、
// この割り切りで足りる。構造を変えるときはここも合わせて直すこと。

import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function readTranslationKeys() {
  const source = await readFile(resolve(ROOT, 'data/translations.ts'), 'utf-8');
  const keys = new Set();
  for (const match of source.matchAll(/^\s*'([^']+)':\s*'/gm)) {
    keys.add(match[1]);
  }
  return keys;
}

/** スナップショットに登場して translations.ts に無いチーム名を返す */
export function findUntranslated(snapshot, keys) {
  const missing = new Map();
  for (const league of snapshot.leagues ?? []) {
    for (const match of league.matches ?? []) {
      for (const name of [match.home, match.away]) {
        if (name && !keys.has(name)) missing.set(name, league.name);
      }
    }
  }
  return [...missing].map(([name, league]) => ({ name, league }));
}
