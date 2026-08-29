import { getFeedMatchesByTeams, getTeamNames } from '@/data/league';
import { leagues } from '@/data/leagueId';
import { toIcsEvent } from '@/utils/match-to-ics';
import { buildCalendar } from '@/utils/ics';

// チームの組み合わせは数が多すぎて事前生成できない。
// 要求されたものだけ生成し、以後キャッシュさせる。
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

const MAX_TEAMS = 20;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ids: string }> }
) {
  const { ids } = await params;

  const teamIds = [
    ...new Set(
      ids
        .replace(/\.ics$/, '')
        .split('+')
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0)
    ),
  ].sort((a, b) => a - b);

  // URLが無制限に長くなると生成コストとキャッシュ数が膨らむため上限を設ける
  if (teamIds.length === 0 || teamIds.length > MAX_TEAMS) {
    return new Response('Not Found', { status: 404 });
  }

  const names = getTeamNames();
  const found = teamIds.filter((id) => names.has(id));
  if (found.length === 0) {
    return new Response('Not Found', { status: 404 });
  }

  const leagueById = new Map(leagues.map((league) => [league.id, league]));
  const events = getFeedMatchesByTeams(found)
    .flatMap(({ match, leagueId }) => {
      const league = leagueById.get(leagueId);
      return league ? [toIcsEvent(match, league)] : [];
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const label =
    found.length <= 3
      ? found.map((id) => names.get(id)).join(' / ')
      : `お気に入り${found.length}チーム`;

  const body = buildCalendar({
    name: `${label} 試合日程`,
    description: `${label}の試合日程。Football Calendar が配信`,
    events,
    refreshIntervalMinutes: 720,
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="teams-${found.join('-')}.ics"`,
    },
  });
}
