"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Match } from "@/types/match";
import { Menu } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
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

export default function MobileNav({
  competitionByGroup,
}: {
  competitionByGroup: competitionByGroupProps;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { register, watch, setValue } = useForm<FormValues>({
    defaultValues: { leagues: [] },
  });
  const selectedLeagues = watch("leagues");

  useEffect(() => {
    
    const leagues = searchParams.get("leagues");
    if (leagues) {
      setValue("leagues", leagues.split(","));
    }
  }, [searchParams, setValue]);

  const handleLeagueToggle = (leagueName: string) => {

    const newSelectedLeagues = selectedLeagues.includes(leagueName)
      ? selectedLeagues.filter((league) => league !== leagueName)
      : [...selectedLeagues, leagueName];
    setValue("leagues", newSelectedLeagues);

    const params = new URLSearchParams(window.location.search);

    if (newSelectedLeagues.length > 0) {
      params.set("leagues", newSelectedLeagues.join(","));
    } else {
      params.delete("leagues");
    }
    router.replace(`?${params.toString()}`);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" className="lg:hidden" variant="outline">
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>リーグを選ぶ</SheetTitle>
        </SheetHeader>
        <div className="mt-2 overflow-auto">
          <div>
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
                      {...register("leagues")}
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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
