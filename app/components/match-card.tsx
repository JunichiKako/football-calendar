import Image from "next/image";

type MatchProps = {
  matches: {
    competitionId: number;
    matchId: number;
    home: string;
    away: string;
    time: string;
    homeEmblemUrl: string;
    awayEmblemUrl: string;
  }[];
};

export default function MatchCard({ matches }: MatchProps) {
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <div
            key={match.matchId}
            className="w-full p-4 mt-2 shadow-lg rounded-lg flex justify-between items-center border"
          >
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <Image
                  src={match.homeEmblemUrl}
                  width={24}
                  height={24}
                  alt={match.home}
                  className="mr-2"
                />
                <span className="text-xs font-semibold">{match.home}</span>
              </div>
              <div className="flex items-center">
                <Image
                  src={match.awayEmblemUrl}
                  width={24}
                  height={24}
                  alt={match.away}
                  className="mr-2"
                />
                <span className="text-xs font-semibold">{match.away}</span>
              </div>
            </div>
            <div className="border-l-2 border-gray-300 h-10"></div>
            <div className="pl-4 text-sm font-semibold">{match.time}</div>
          </div>
        ))}
      </div>
    </>
  );
}
