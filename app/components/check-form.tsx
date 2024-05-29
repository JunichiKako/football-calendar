"use client";

import { Match } from "@/types/match";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type competitionByGroupProps = {
  [key: string]: {
    competitionId: number;
    competitionName: string;
    competitionImg: string;
    matches: Match[];
  };
};

type FormValues = {
  leagues: string[];
};

export function CheckForm({ competitionByGroup }: { competitionByGroup: competitionByGroupProps }) {
  // 現状のクエリパラメータを取得
  const router = useRouter();
  const { register, watch, setValue } = useForm<FormValues>({
    defaultValues: { leagues: [] },
  });

  // defaultValues: { leagues: [] } で初期値を設定・監視している
  const selectedLeagues = watch("leagues");

  const handleLeagueToggle = (leagueName: string) => {
    // 現在の選択状態に基づいて新しい選択状態を決定
    const newSelectedLeagues = selectedLeagues.includes(leagueName)
      ? selectedLeagues.filter((league) => league !== leagueName)
      : [...selectedLeagues, leagueName];
    // フォームフィールドの値を更新
    setValue("leagues", newSelectedLeagues);

    // 現在のクエリパラメータを取得
    const params = new URLSearchParams(window.location.search);
    // 新しい選択状態に基づいてクエリパラメータを設定
    if (newSelectedLeagues.length > 0) {
      params.set("leagues", newSelectedLeagues.join(","));
    } else {
      params.delete("leagues");
    }
    // 新しいURLを設定
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="flex">
      <aside className="">
        {Object.keys(competitionByGroup).map((leagueName) => {
          const league = competitionByGroup[leagueName];
          return (
            <div
              key={league.competitionId}
              className="hover:bg-gray-100 p-2 rounded-lg cursor-pointer"
            >
              <label className="cursor-pointer flex items-center gap-3">
                <input
                  type="checkbox"
                  value={leagueName}
                  {...register("leagues")}
                  onChange={() => handleLeagueToggle(leagueName)}
                  className="hidden"
                />
                <div className="w-4 h-4 flex items-center justify-center border border-gray-300 rounded-full transition-colors duration-300">
                  {selectedLeagues.includes(leagueName) && (
                    <svg
                      className="w-8 h-8 text-blue-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  )}
                </div>
                <Image
                  src={league.competitionImg}
                  alt={league.competitionName}
                  width={32}
                  height={32}
                />
                <span className="ml-2 text-gray-700">{league.competitionName}</span>
              </label>
            </div>
          );
        })}
      </aside>
    </div>
  );
}
