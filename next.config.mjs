const isDev = process.env.NODE_ENV === 'development';

// Content-Security-Policy
// - script-src の 'unsafe-inline' は Next.js が挿入するブートストラップ用の
//   インラインスクリプトのために必要。排除するには middleware で nonce を
//   発行する必要があり、全ページが動的レンダリングになるため採用していない。
// - 'unsafe-eval' は開発時の HMR にのみ必要なので本番では付けない。
const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-src 'none'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `manifest-src 'self'`,
  `font-src 'self'`,
  // Google Analytics (gtag.js)。
  // @vercel/analytics は本番では /_vercel/insights/script.js (同一オリジン) を
  // 読むが、開発時のみ va.vercel-scripts.com から debug スクリプトを読むため
  // 開発時限定で許可する。
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ''} https://www.googletagmanager.com`,
  `style-src 'self' 'unsafe-inline'`,
  // エンブレムは remotePatterns に登録済みのホストなら /_next/image 経由
  // (同一オリジン) で配信される。未登録ホストは Next.js が生の <img> として
  // そのまま出力するため、配信元も img-src に列挙しておく必要がある。
  `img-src 'self' data: blob: https://crests.football-data.org https://upload.wikimedia.org https://www.googletagmanager.com https://*.google-analytics.com`,
  // Vercel Analytics は本番では /_vercel/insights/* (同一オリジン) に送る
  `connect-src 'self'${isDev ? ' https://va.vercel-scripts.com' : ''} https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com`,
  `upgrade-insecure-requests`,
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'crests.football-data.org' },
      // football-data.org は一部チームのエンブレムを Wikimedia でホストしている
      // (2026/27時点: Le Mans FC など)。未登録だと最適化されず生の img になる
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async rewrites() {
    return [
      // リーグ別
      { source: '/premier-league', destination: '/?leagues=Premier+League&view=time' },
      { source: '/la-liga', destination: '/?leagues=Primera+Division&view=time' },
      { source: '/serie-a', destination: '/?leagues=Serie+A&view=time' },
      { source: '/bundesliga', destination: '/?leagues=Bundesliga&view=time' },
      { source: '/ligue-1', destination: '/?leagues=Ligue+1&view=time' },
      { source: '/champions-league', destination: '/?leagues=UEFA+Champions+League&view=time' },
    ];
  },
};

export default nextConfig;
