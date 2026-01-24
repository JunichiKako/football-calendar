/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "crests.football-data.org",
      },
    ],
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
