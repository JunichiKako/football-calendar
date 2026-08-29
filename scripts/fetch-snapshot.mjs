// football-data.org から全リーグのシーズン全日程を取得し data/snapshot.json に保存する。
//
// GitHub Actions から1日1回実行される。アプリはこのファイルを読むだけにして、
// 表示のたびにAPIを叩かない構成にするのが狙い。
//
// 設計上の要点:
//   - 取得に失敗したリーグは既存データを保持する。全上書きにすると、APIが一度
//     コケただけで「試合ゼロ」がコミットされ、それがそのまま配信されてしまう。
//   - 出力のキー順と並び順を固定する。差分を「変わった試合の行」だけに抑えて、
//     git履歴を日程変更の記録として読めるようにするため。
//   - status は捨てずに残す。SCHEDULED は時刻未定でダミーの0時UTCが入っており、
//     TIMED に変わったことを検知するのに必要（ICS配信で SEQUENCE を上げる根拠）。

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = resolve(ROOT, 'data/snapshot.json');
const API_BASE = 'https://api.football-data.org/v4';

// data/leagueId.ts と同じ並び。TypeScript を読ませずに済むよう定義を持つ。
// リーグを増やすときは両方に足すこと。
const LEAGUES = [
  { id: 2021, name: 'Premier League' },
  { id: 2001, name: 'UEFA Champions League' },
  { id: 2002, name: 'Bundesliga' },
  { id: 2014, name: 'Primera Division' },
  { id: 2019, name: 'Serie A' },
  { id: 2015, name: 'Ligue 1' },
];

const API_KEY = process.env.FOOTBALL_API_KEY;
if (!API_KEY) {
  console.error('FOOTBALL_API_KEY が設定されていません');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 現在のシーズン開始年。7月を境に切り替える（欧州リーグは8月開幕） */
function currentSeason() {
  const now = new Date();
  return now.getUTCMonth() + 1 >= 7 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
}

/** ICS配信と画面表示に必要な項目だけに絞る。生JSONの2割程度まで落ちる */
function toRecord(match) {
  return {
    id: match.id,
    utcDate: match.utcDate,
    status: match.status,
    matchday: match.matchday ?? null,
    stage: match.stage ?? null,
    homeId: match.homeTeam.id ?? null,
    home: match.homeTeam.name ?? null,
    homeCrest: match.homeTeam.crest ?? null,
    awayId: match.awayTeam.id ?? null,
    away: match.awayTeam.name ?? null,
    awayCrest: match.awayTeam.crest ?? null,
  };
}

async function fetchLeague(id, season) {
  const res = await fetch(`${API_BASE}/competitions/${id}/matches?season=${season}`, {
    headers: { 'X-Auth-Token': API_KEY },
  });

  if (!res.ok) {
    // 404 はそのシーズンの日程が未公開の場合にも返る（例: CLの組み合わせ抽選前）
    throw new Error(`HTTP ${res.status}${res.status === 429 ? ' (レート制限)' : ''}`);
  }

  const data = await res.json();
  const matches = (data.matches ?? []).map(toRecord);
  // 同着順の揺れで無駄な差分が出ないよう、日時→IDの順で安定ソートする
  matches.sort((a, b) => a.utcDate.localeCompare(b.utcDate) || a.id - b.id);
  return matches;
}

async function readPrevious() {
  try {
    return JSON.parse(await readFile(OUTPUT, 'utf-8'));
  } catch {
    return null;
  }
}

async function main() {
  const season = currentSeason();
  const previous = await readPrevious();
  const previousLeagues = new Map(
    (previous?.leagues ?? []).map((league) => [league.id, league])
  );

  const leagues = [];
  const failed = [];

  for (const [index, def] of LEAGUES.entries()) {
    // 無料枠は10リクエスト/分。6本なら余裕だが、CI上の再試行と重なっても
    // 当たらないよう逐次＋間隔を空けて叩く。
    if (index > 0) await sleep(7000);

    try {
      const matches = await fetchLeague(def.id, season);
      leagues.push({ ...def, season, matches });
      console.log(`  ${def.name}: ${matches.length}試合`);
    } catch (error) {
      const kept = previousLeagues.get(def.id);
      failed.push(`${def.name} (${error.message})`);

      if (kept) {
        // 取得に失敗したリーグは前回のデータをそのまま残す。
        // ここで空にすると「試合なし」がコミットされて配信に載ってしまう。
        leagues.push(kept);
        console.warn(`  ${def.name}: ${error.message} → 前回のデータを保持 (${kept.matches.length}試合)`);
      } else {
        leagues.push({ ...def, season, matches: [] });
        console.warn(`  ${def.name}: ${error.message} → 前回データもないため空`);
      }
    }
  }

  const total = leagues.reduce((n, league) => n + league.matches.length, 0);

  const snapshot = {
    // fetchedAt は「いつ時点の情報か」を画面に出すために持つ。
    // 取得が全滅した場合は前回の値を保つ（更新していないのに更新したと見せない）
    fetchedAt: failed.length === LEAGUES.length && previous
      ? previous.fetchedAt
      : new Date().toISOString(),
    season,
    leagues,
  };

  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`);

  console.log(`\n合計 ${total}試合 / ${leagues.length}リーグ`);
  if (failed.length > 0) console.log(`取得失敗: ${failed.join(', ')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
