'use client';

// お気に入りチームは localStorage にだけ持つ。サーバーには送らない。
// ユーザー登録もDBも不要で、購読URLはチームIDから組み立てられるため。

const STORAGE_KEY = 'football-calendar:favorite-teams';
const EVENT = 'favorites-changed';

/** サーバー描画時とストレージが空のときに返す不変の値 */
const EMPTY: number[] = [];

// useSyncExternalStore は「変化がなければ同じ参照」を返すことを要求する。
// 毎回パースして新しい配列を返すと再描画が止まらなくなるため、
// 生の文字列をキーにしてキャッシュする。
let cachedRaw: string | null = null;
let cachedValue: number[] = EMPTY;

function rawValue(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // プライベートウィンドウなど、読めない環境がある
    return null;
  }
}

export function getFavorites(): number[] {
  const raw = rawValue();
  if (raw === cachedRaw) return cachedValue;

  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    cachedValue = Array.isArray(parsed)
      ? parsed.filter((id): id is number => typeof id === 'number')
      : EMPTY;
  } catch {
    cachedValue = EMPTY;
  }
  return cachedValue;
}

/** サーバー描画時のスナップショット。常に空 */
export function getServerFavorites(): number[] {
  return EMPTY;
}

export function setFavorites(ids: number[]): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...ids].sort((a, b) => a - b))
    );
  } catch {
    // 保存できなくても操作自体は続行させる
  }
  // 同一タブ内の他コンポーネントにも知らせる(storageイベントは別タブにしか飛ばない)
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function subscribeFavorites(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}
