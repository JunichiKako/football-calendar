'use client';

/**
 * お気に入りチームでの絞り込み。
 *
 * お気に入りは localStorage にあるためサーバーでは分からない。
 * かといってクライアントで再レンダリングすると SSR したHTMLを捨てることに
 * なるので、サーバー描画したカードを CSS の属性セレクタで隠す形にしている。
 * data-team には試合に出る2チームのIDが空白区切りで入っており、
 * `~=` で1つずつ照合できる。
 */
export default function FavoriteFilter({ teamIds }: { teamIds: number[] }) {
  if (teamIds.length === 0) return null;

  const matchAny = teamIds.map((id) => `[data-team~="${id}"]`).join(', ');
  const notAny = teamIds.map((id) => `:not([data-team~="${id}"])`).join('');

  const css = [
    `[data-match]${notAny}{display:none}`,
    // 1試合も残らないリーグは見出しごと隠す
    `[data-league-section]:not(:has(${matchAny})){display:none}`,
  ].join('');

  return <style>{css}</style>;
}

