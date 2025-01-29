const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // 本番用のドメイン
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Vercel自動設定
    'http://localhost:3000/'; // ローカル開発用

  // httpから始まらない場合はhttpsを追加
  url = url.startsWith('http') ? url : `https://${url}`;

  // 末尾のスラッシュを確実に付ける
  url = url.endsWith('/') ? url : `${url}/`;

  return url;
};
