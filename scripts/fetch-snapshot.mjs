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
import { findUntranslated, readTranslationKeys } from './translations.mjs';
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

// テストから reconcile だけを import できるよう、直接実行されたときのみ main を走らせる
const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 現在のシーズン開始年。7月を境に切り替える（欧州リーグは8月開幕） */
function currentSeason() {
  const now = new Date();
  return now.getUTCMonth() + 1 >= 7 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
}

/**
 * ICS配信で「変更あり」とみなす条件。
 * IN_PLAY や FINISHED への遷移はカレンダー上の予定を変えないので無視する。
 * これを含めると毎日 SEQUENCE が上がり、購読側に無意味な更新通知が飛ぶ。
 */
const CANCELLED_STATUSES = new Set(['POSTPONED', 'CANCELLED', 'SUSPENDED']);

function icsRelevant(record) {
  return {
    utcDate: record.utcDate,
    undecided: record.status === 'SCHEDULED',
    cancelled: CANCELLED_STATUSES.has(record.status),
  };
}

function hasIcsChange(before, after) {
  const a = icsRelevant(before);
  const b = icsRelevant(after);
  return a.utcDate !== b.utcDate || a.undecided !== b.undecided || a.cancelled !== b.cancelled;
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

/**
 * 前回のスナップショットと突き合わせて seq(SEQUENCE) を決める。
 * ICS では同じ UID のイベントを更新するとき SEQUENCE を増やす必要があり、
 * 前回配った番号を知らないと採番できない。実行時に git 履歴は読めないので
 * スナップショット自身に持たせる。
 *
 * APIから消えた試合も捨てない。黙って消すと購読者のカレンダーに古い予定が
 * 残り続けるため、CANCELLED として配り続ける(キックオフ予定日から7日間)。
 */
export function reconcile(current, previous) {
  const prevById = new Map((previous ?? []).map((m) => [m.id, m]));
  const result = [];

  for (const match of current) {
    const before = prevById.get(match.id);
    if (!before) {
      result.push({ ...match, seq: 0 });
      continue;
    }
    result.push({
      ...match,
      seq: hasIcsChange(before, match) ? (before.seq ?? 0) + 1 : before.seq ?? 0,
    });
  }

  // 今回のレスポンスから消えた試合を CANCELLED として残す
  const currentIds = new Set(current.map((m) => m.id));
  const dropAfter = Date.now() - 7 * 24 * 60 * 60 * 1000;

  for (const before of prevById.values()) {
    if (currentIds.has(before.id)) continue;
    if (new Date(before.utcDate).getTime() < dropAfter) continue; // 十分に過去なら配信終了

    result.push(
      before.status === 'CANCELLED'
        ? before // すでに中止として配信済み。SEQUENCE は上げない
        : { ...before, status: 'CANCELLED', seq: (before.seq ?? 0) + 1 }
    );
  }

  result.sort((a, b) => a.utcDate.localeCompare(b.utcDate) || a.id - b.id);
  return result;
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
      const fetched = await fetchLeague(def.id, season);
      const matches = reconcile(fetched, previousLeagues.get(def.id)?.matches);
      leagues.push({ ...def, season, matches });

      const updated = matches.filter((m) => (m.seq ?? 0) > 0).length;
      const cancelled = matches.filter((m) => m.status === 'CANCELLED').length;
      const detail = [
        updated > 0 && `更新 ${updated}`,
        cancelled > 0 && `中止 ${cancelled}`,
      ].filter(Boolean).join(' / ');
      console.log(`  ${def.name}: ${matches.length}試合${detail ? ` (${detail})` : ''}`);
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

  // 昇格チームが入ると日本語表記が無いまま英語で表示されてしまう。
  // 気づける手段が無いと放置されるため、ここで検知して警告する。
  // GitHub Actions では ::warning:: が実行結果に注記として出る。
  const missing = findUntranslated(snapshot, await readTranslationKeys());
  if (missing.length > 0) {
    const list = missing.map((m) => `${m.name} (${m.league})`).join(', ');
    console.warn(`\n::warning::data/translations.ts に未登録のチームが${missing.length}件あります: ${list}`);
  }
}

if (isMain) {
  if (!API_KEY) {
    console.error('FOOTBALL_API_KEY が設定されていません');
    process.exit(1);
  }
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
