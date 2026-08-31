// data/snapshot.json の変更内容を1行にまとめる。コミットメッセージに使う。
//
// 「変更」として数えるのは seq が上がったものだけにする。seq は reconcile() が
// 「購読者に届く変更か」を判断して採番しているため、これが唯一の正しい基準になる。
// 単に status の差分を数えると、試合が終わっただけ(TIMED -> FINISHED)でも
// 「変更29件」と出てしまい、実際には購読者に何も届かないので履歴が誤解を招く。

import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PATH = 'data/snapshot.json';

const byId = (snapshot) =>
  new Map(snapshot.leagues.flatMap((league) => league.matches.map((m) => [m.id, m])));

export function summarizeChanges(before, after) {
  const a = byId(before);
  const b = byId(after);

  const added = [...b.keys()].filter((id) => !a.has(id)).length;
  const removed = [...a.keys()].filter((id) => !b.has(id)).length;

  // 購読者に届く変更（reconcile が seq を上げたもの）
  const updated = [...b.entries()].filter(
    ([id, m]) => a.has(id) && (m.seq ?? 0) > (a.get(id).seq ?? 0)
  ).length;

  // 配信内容は変わらないが、履歴として分かるようにしておく
  const finished = [...b.entries()].filter(
    ([id, m]) => a.has(id) && a.get(id).status !== 'FINISHED' && m.status === 'FINISHED'
  ).length;

  const total = after.leagues.reduce((n, league) => n + league.matches.length, 0);

  const parts = [
    added && `追加 ${added}`,
    removed && `削除 ${removed}`,
    updated && `配信更新 ${updated}`,
    finished && `試合終了 ${finished}`,
  ].filter(Boolean);

  return `${total}試合 (${parts.join(' / ') || '内容の更新'})`;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const after = JSON.parse(readFileSync(resolve(ROOT, PATH), 'utf-8'));
  const before = JSON.parse(execSync(`git show HEAD:${PATH}`, { encoding: 'utf-8' }));
  console.log(summarizeChanges(before, after));
}
