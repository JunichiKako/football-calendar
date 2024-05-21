"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Match } from "@/types/match";
import Image from "next/image";

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
  // 現状んのクエリパラメータを取得
  const searchParams = useSearchParams();
  // ルーターを取得
  const router = useRouter();
  const { register, watch, setValue } = useForm<FormValues>({
    defaultValues: { leagues: [] },
  });

  // defaultValues: { leagues: [] } で初期値を設定・監視している
  const selectedLeagues = watch("leagues");

  // searchparamsに変更があった場合に、setValueで値を更新
  useEffect(() => {
    const leagues = searchParams.get("leagues");
    if (leagues) {
      setValue("leagues", leagues.split(","));
    }
  }, [searchParams, setValue]);

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
              <label className="flex gap-4 items-center">
                <input
                  type="checkbox"
                  value={leagueName}
                  // registerでleaguesというフォームフィールドを登録
                  {...register("leagues")}
                  // チェックした時にその部分のリーグ名を追加し、その上でhandleLeagueToggleを実行
                  checked={selectedLeagues.includes(leagueName)}
                  onChange={() => handleLeagueToggle(leagueName)}
                  className="form-checkbox h-4 w-4"
                />
                <Image
                  src={league.competitionImg}
                  alt={league.competitionName}
                  width={32}
                  height={32}
                />
                <span className="">{league.competitionName}</span>
              </label>
            </div>
          );
        })}
      </aside>
    </div>
  );
}
