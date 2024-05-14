import { ChevronLeft, ChevronRight } from "lucide-react";
import MatchList from "./components/match-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getFootballCompetitionList } from "@/data/competitions-list";
import Image from "next/image";

export default async function Home() {
  const competitionList = await getFootballCompetitionList();

  const formattedSchedule = competitionList.flat().map((match) => {
    return {
      id: match.id,
      competition: match.competition.name,
      date: new Date(match.utcDate).toLocaleString(),
      homeTeam: match.homeTeam.name,
      homeEmblemUrl: match.homeTeam.crest,
      awayTeam: match.awayTeam.name,
      awayEmblemUrl: match.awayTeam.crest,
    };
  });

  console.log(formattedSchedule);

  return (
    <>
      <div>
        {formattedSchedule.map((competition) => {
          return (
            <div className="mt-20" key={competition.id}>
              <p>{competition.competition}</p>
              <p>{competition.date}</p>
              <Image src={competition.homeEmblemUrl} alt={""} width={100} height={100} />
              <p>{competition.homeTeam}</p>
              <Image src={competition.awayEmblemUrl} alt={""} width={100} height={100} />
              <p>{competition.awayTeam}</p>
            </div>
          );
        })}
      </div>
      <div className="sticky top-12 bg-card md:px-4 lg:block lg:ml-64 ">
        <div className="pt-4 py-4 flex items-center justify-between w-full4 mt-18 lg:mt-20 lg:justify-around lg:pt-8">
          <Button variant="ghost" asChild>
            <Link href={"/"} className="flex items-center text-sm sm:text-base lg:text-xl lg:gap-4">
              <ChevronLeft className="h-4 w-4" />
              05/06
            </Link>
          </Button>
          <p className="font-semibold border-b-2 text-xl lg:text-xl ">05/07(土)</p>
          <Button variant="ghost" asChild>
            <Link href={"/"} className="flex items-center text-sm sm:text-base lg:text-xl lg:gap-4">
              05/08 <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="lg:ml-64 lg:text-center">
        スケジュールを見たいリーグをサイドバーから選んでください
      </div>
      <MatchList />
    </>
  );
}
