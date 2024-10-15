"use client";

import React, { useState, useCallback } from "react";
import { Match } from "@/types/match";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TeamLabel } from "@/utils/team-label";

type ClientMatchCardProps = {
  leagues: {
    [leagueName: string]: {
      leagueId: number;
      leagueName: string;
      leagueImg: string;
      matches: Match[];
    };
  };
};

const ClientMatchCard = React.memo(function ClientMatchCard({
  leagues,
}: ClientMatchCardProps) {
  const [selectedMatches, setSelectedMatches] = useState<
    Record<string, boolean>
  >({});
  const router = useRouter();

  const handleCheckboxChange = useCallback(
    (matchId: string, isChecked: boolean) => {
      setSelectedMatches((prev) => ({
        ...prev,
        [matchId]: isChecked,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const selectedMatchIds = Object.entries(selectedMatches)
        .filter(([_, isSelected]) => isSelected)
        .map(([id, _]) => id);

      if (selectedMatchIds.length === 0) {
        alert("少なくとも1つのマッチを選択してください。");
        return;
      }

      const params = new URLSearchParams();
      selectedMatchIds.forEach((id) => params.append("matchIds", id));
      const url = `/confirm-matches?${params.toString()}`;

      try {
        router.push(url);
      } catch (error) {
        alert("ページの遷移に失敗しました。もう一度お試しください。");
      }
    },
    [selectedMatches, router]
  );

  return (
    <form onSubmit={handleSubmit} className="relative pb-20">
      {Object.entries(leagues).map(([leagueName, league]) => (
        <div key={leagueName} className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Image
              src={league.leagueImg}
              alt={leagueName}
              width={24}
              height={24}
              className="mr-2"
            />
            {leagueName}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
            {league.matches.map((match) => (
              <div key={match.matchId} className="relative">
                <input
                  type="checkbox"
                  id={match.matchId.toString()}
                  checked={selectedMatches[match.matchId] || false}
                  onChange={(e) =>
                    handleCheckboxChange(
                      match.matchId.toString(),
                      e.target.checked
                    )
                  }
                  className="absolute top-2 right-2 h-4 w-4 z-10"
                />
                <label
                  htmlFor={match.matchId.toString()}
                  className="p-4 shadow-lg rounded-lg flex justify-between items-center border cursor-pointer"
                >
                  <div className="flex-1 space-y-3">
                    <TeamLabel
                      imageURL={match.homeEmblemUrl}
                      name={match.home}
                    />
                    <TeamLabel
                      imageURL={match.awayEmblemUrl}
                      name={match.away}
                    />
                  </div>
                  <div className="border-l-2 border-border h-10"></div>
                  <div className="flex justify-center pl-4 flex-col items-center">
                    <div className="text-sm font-semibold mb-0.5">
                      {match.matchDate}
                    </div>
                    <time className="text-base tabular-nums font-medium">
                      {match.matchTime}
                    </time>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="fixed bottom-4 right-4 z-10">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          選択したマッチを確定
        </button>
      </div>
    </form>
  );
});

export default ClientMatchCard;
