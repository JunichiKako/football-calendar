import { leagues } from '@/data/leagueId';

/**
 * リーグ名(APIの表記)の配列から購読URLを組み立てる。
 *
 * slug は定義順に並べる。順序違いのURLが別のキャッシュエントリに
 * ならないようにするため。
 */
export function feedUrlFor(
  baseUrl: string,
  leagueNames: string[]
): { url: string; label: string } | null {
  const selected = leagues.filter((league) => leagueNames.includes(league.name));
  if (selected.length === 0) return null;

  const slug = selected.map((league) => league.slug).join('+');
  const label =
    selected.length === leagues.length
      ? '欧州主要リーグ'
      : selected.map((league) => league.labelJa).join(' / ');

  return { url: `${baseUrl}/calendar/${slug}.ics`, label };
}
