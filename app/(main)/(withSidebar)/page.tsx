import { Suspense } from 'react';
import { Metadata } from 'next';
import LeagueList from '@/components/main/league-list';
import TimeScheduleList from '@/components/main/time-schedule-list';

type HomeParamsProps = {
  searchParams: Promise<{
    leagues?: string;
    view?: string;
  }>;
};

// リーグごとのメタデータ設定
const leagueMetadata: Record<string, { title: string; description: string }> = {
  'Premier League': {
    title: 'プレミアリーグ 試合日程・放送予定',
    description: 'プレミアリーグの試合日程と放送予定を一覧で確認。今週の試合がすぐわかる。',
  },
  'Primera Division': {
    title: 'ラ・リーガ 試合日程・放送予定',
    description: 'ラ・リーガ（スペイン）の試合日程と放送予定を一覧で確認。今週の試合がすぐわかる。',
  },
  'Serie A': {
    title: 'セリエA 試合日程・放送予定',
    description: 'セリエA（イタリア）の試合日程と放送予定を一覧で確認。今週の試合がすぐわかる。',
  },
  'Bundesliga': {
    title: 'ブンデスリーガ 試合日程・放送予定',
    description: 'ブンデスリーガ（ドイツ）の試合日程と放送予定を一覧で確認。今週の試合がすぐわかる。',
  },
  'Ligue 1': {
    title: 'リーグ・アン 試合日程・放送予定',
    description: 'リーグ・アン（フランス）の試合日程と放送予定を一覧で確認。今週の試合がすぐわかる。',
  },
  'UEFA Champions League': {
    title: 'チャンピオンズリーグ 試合日程・放送予定',
    description: 'UEFAチャンピオンズリーグの試合日程と放送予定を一覧で確認。今週の試合がすぐわかる。',
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
  };
}

// キャッシュのためこの/でviewを切り替えて表示する
export default async function Home({ searchParams }: HomeParamsProps) {
  const { currentView, selectedLeagues } = await getPageParams(searchParams);

  if (currentView === 'time') {
    return (
      <Suspense fallback={<div>Loading time...</div>}>
        <TimeScheduleList selectedLeagues={selectedLeagues} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Loading league...</div>}>
      <LeagueList selectedLeagues={selectedLeagues} />
    </Suspense>
  );
}
