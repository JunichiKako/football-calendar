// components/selected-time-match-card.tsx
import { Match } from "@/types/match";
import Image from "next/image";
import { TeamLabel } from "@/utils/team-label";
import { saveMatchSelections } from "@/actions/matches";
import { SelectedMatchSubmitBtn } from "./selected-match-submit-btn";
import { cn } from "@/lib/utils";
import MatchCheckbox from "./match-check-box";

type SelectedTimeMatchCardProps = {
  matches: Match[];
  selectedMatches: string[]; // 追加
};

export default function SelectedTimeMatchCard({
  matches,
  selectedMatches,
}: SelectedTimeMatchCardProps) {
  // 試合をリーグごとにグループ化
  const groupedMatches: Match[][] = [];
  let currentGroup: Match[] = [];

  matches.forEach((match, index) => {
    if (currentGroup.length === 0) {
      currentGroup.push(match);
    } else {
      const lastMatch = currentGroup[currentGroup.length - 1];

      if (match.leagueName === lastMatch.leagueName) {
        currentGroup.push(match);
      } else {
        groupedMatches.push(currentGroup);
        currentGroup = [match];
      }
    }

    if (index === matches.length - 1) {
      groupedMatches.push(currentGroup);
    }
  });

  async function handleSubmit(formData: FormData) {
    "use server";

    const selectedMatches = formData.getAll("matches") as string[];

    if (selectedMatches.length === 0) {
      return { error: "少なくとも1つのマッチを選択してください。" };
    }

    await saveMatchSelections(selectedMatches);
  }

  return (
    <form action={handleSubmit} className="relative pb-20">
      {groupedMatches.map((matchGroup, groupIndex) => {
        const { leagueName, leagueImg } = matchGroup[0];
        const isPremierLeague = leagueName === "Premier League";

        return (
          <div key={groupIndex} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-block">
                <div className="py-2 rounded-md flex">
                  <Image
                    src={leagueImg}
                    alt={leagueName}
                    width={32}
                    height={32}
                    className={cn("mr-2", {
                      "premier-league-logo": isPremierLeague,
                    })}
                  />
                  <h2 className="text-lg font-bold">{leagueName}</h2>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
              {matchGroup.map((match) => (
                <div key={match.matchId} className="relative">
                  <MatchCheckbox
                    matchId={match.matchId}
                    isSelected={selectedMatches.includes(
                      match.matchId.toString()
                    )}
                  />
                  <label
                    htmlFor={match.matchId.toString()}
                    className="p-4 shadow-lg rounded-lg flex justify-between items-center border cursor-pointer
                    transition-all duration-200 peer-checked:bg-blue-50 peer-checked:border-blue-500 hover:bg-gray-50"
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
        );
      })}
      <div className="fixed bottom-4 right-4 z-10">
        <SelectedMatchSubmitBtn />
      </div>
    </form>
  );
}
