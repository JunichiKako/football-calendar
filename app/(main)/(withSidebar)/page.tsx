import { Suspense } from 'react';
import { Metadata } from 'next';
import LeagueList from '@/components/main/league-list';
import TimeScheduleList from '@/components/main/time-schedule-list';
import { getAvailableMonths, type Range } from '@/data/league';
import { currentMonth } from '@/utils/getDate';

type HomeParamsProps = {
  searchParams: Promise<{
    leagues?: string;
    view?: string;
    range?: string;
    month?: string;
  }>;
};

// リーグごとのメタデータ設定
const leagueMetadata: Record<string, { title: string; description: string }> = {
  'Premier League': {
    title: 'プレミアリーグ 試合日程',
    description: 'プレミアリーグの試合日程を一覧で確認。カレンダーに購読すれば日程変更も自動で反映されます。',
  },
  'Primera Division': {
    title: 'ラ・リーガ 試合日程',
    description: 'ラ・リーガ（スペイン）の試合日程を一覧で確認。カレンダーに購読すれば日程変更も自動で反映されます。',
  },
  'Serie A': {
    title: 'セリエA 試合日程',
    description: 'セリエA（イタリア）の試合日程を一覧で確認。カレンダーに購読すれば日程変更も自動で反映されます。',
  },
  'Bundesliga': {
    title: 'ブンデスリーガ 試合日程',
    description: 'ブンデスリーガ（ドイツ）の試合日程を一覧で確認。カレンダーに購読すれば日程変更も自動で反映されます。',
  },
  'Ligue 1': {
    title: 'リーグ・アン 試合日程',
    description: 'リーグ・アン（フランス）の試合日程を一覧で確認。カレンダーに購読すれば日程変更も自動で反映されます。',
  },
  'UEFA Champions League': {
    title: 'チャンピオンズリーグ 試合日程',
    description: 'UEFAチャンピオンズリーグの試合日程を一覧で確認。カレンダーに購読すれば日程変更も自動で反映されます。',
  },
};

export async function generateMetadata({ searchParams }: HomeParamsProps): Promise<Metadata> {
  const params = await searchParams;
  const leaguesParam = params.leagues || '';
  const league = leaguesParam ? decodeURIComponent(leaguesParam) : '';

  // リーグ指定がある場合はリーグ専用メタデータ
  // Object.hasOwn を使わないと 'constructor' 等のプロトタイプ由来のキーが
  // truthy になり、title が undefined のメタデータを返してしまう
  if (league && Object.hasOwn(leagueMetadata, league)) {
    return {
      title: leagueMetadata[league].title,
      description: leagueMetadata[league].description,
    };
  }

  // デフォルト（トップページ）はlayout.tsxのメタデータを使用
  return {};
}

/** ?range= と ?month= を Range に落とす。不正な値は今週にフォールバックする */
function parseRange(rangeParam?: string, monthParam?: string): Range {
  if (rangeParam === 'all') return { kind: 'all' };

  if (rangeParam === 'month') {
    const months = getAvailableMonths();
    if (monthParam && months.includes(monthParam)) {
      return { kind: 'month', month: monthParam };
    }
    // 指定がない場合は今月。シーズン外なら直近の未来の月、それも無ければ最終月
    const now = currentMonth();
    const fallback = months.includes(now)
      ? now
      : months.find((m) => m >= now) ?? months.at(-1) ?? now;
    return { kind: 'month', month: fallback };
  }

  return { kind: 'week' };
}

async function getPageParams(searchParams: HomeParamsProps['searchParams']) {
  const params = await searchParams;
  const view = params.view || 'league';

  // デコードを明示的に行う
  const leaguesParam = params.leagues || '';
  const leagues = leaguesParam
    ? decodeURIComponent(leaguesParam).split(',')
    : [];

  return {
    currentView: view,
    selectedLeagues: leagues,
    range: parseRange(params.range, params.month),
    params,
  };
}

// キャッシュのためこの/でviewを切り替えて表示する
export default async function Home({ searchParams }: HomeParamsProps) {
  const { currentView, selectedLeagues, range, params } = await getPageParams(searchParams);

  if (currentView === 'time') {
    return (
      <Suspense fallback={<div>Loading time...</div>}>
        <TimeScheduleList
          selectedLeagues={selectedLeagues}
          range={range}
          params={params}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Loading league...</div>}>
      <LeagueList selectedLeagues={selectedLeagues} range={range} params={params} />
    </Suspense>
  );
}
