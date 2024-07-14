import { Match } from "@/types/match";
import Image from "next/image";

type MatchProps = {
  matches: Match[];
};

export default function MatchCard({ matches }: MatchProps) {
  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="size-6 mr-2"
                />
                <p className="text-xs">{match.home}</p>
              </div>
              <div className="flex items-center">
                <Image
                  src={match.awayEmblemUrl}
                  width={24}
                  height={24}
                  alt={match.away}
                  className="size-6 mr-2"
                />
                <p className="text-xs">{match.away}</p>
              </div>
            </div>
            <div className="border-l-2 border-border h-10"></div>
            <div className="flex flex-col items-center">
              <div className="pl-5 text-xs mb-2">{match.matchDate}</div>
              <div className="pl-5 text-xs font-semibold">{match.matchTime}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
