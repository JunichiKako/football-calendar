import { getFeedMatches } from '@/data/league';
import { leagueBySlug, leagues, type LeagueDef } from '@/data/leagueId';
import { toIcsEvent } from '@/utils/match-to-ics';
import { buildCalendar } from '@/utils/ics';

// 単一リーグ分は事前生成する。スナップショットはデプロイ時に固定されるため
// 静的ルートになり、CDNがキャッシュできる。
// 複数リーグの組み合わせは 2^6-1=63 通りあり全部焼くとビルド出力が膨らむため、
// 要求されたものだけオンデマンドで生成して以後キャッシュさせる。
export const dynamicParams = true;

export function generateStaticParams() {
  return leagues.map((league) => ({ slug: `${league.slug}.ics` }));
}

/**
 * slug からリーグを解決する。
 * 複数指定は "premier-league+bundesliga.ics" の形。順序が違うだけのURLが
 * 別キャッシュにならないよう、定義順に正規化して扱う。
 */
function resolveLeagues(slug: string): LeagueDef[] | null {
  const names = slug.replace(/\.ics$/, '').split('+');
  const found = names.map((name) => leagueBySlug.get(name));

  if (found.some((league) => !league)) return null;

  const ids = new Set(found.map((league) => league!.id));
  return leagues.filter((league) => ids.has(league.id));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const targets = resolveLeagues(slug);

  if (!targets || targets.length === 0) {
    return new Response('Not Found', { status: 404 });
  }

  const events = targets
    .flatMap((league) => getFeedMatches(league.id).map((match) => toIcsEvent(match, league)))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const label =
    targets.length === 1
      ? targets[0].labelJa
      : targets.length === leagues.length
        ? '欧州主要リーグ'
        : targets.map((league) => league.labelJa).join(' / ');

  const body = buildCalendar({
    name: `${label} 試合日程`,
    description: `${label}の試合日程。Football Calendar が配信`,
    events,
    // 購読側への希望値。Googleは無視するがAppleなどは参照する
    refreshIntervalMinutes: 720,
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${slug.replace(/\.ics$/, '')}.ics"`,
    },
  });
}
