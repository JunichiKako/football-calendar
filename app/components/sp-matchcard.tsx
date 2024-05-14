import Image from "next/image";

type MatchProps = {
  matches: {
    id: number;
    home: string;
    away: string;
    time: string;
  }[];
};

function formatTeamNameToImagePath(teamName: string) {
  return `/images/${teamName.toLowerCase().replace(/ /g, "-")}.png`;
}

export default function SpMatchcard({ matches }: MatchProps) {
  return (
    <>
      <div className="flex flex-col gap-4">
        {matches.map((match) => (
          <div
            key={match.id}
            className=" w-full p-4 mt-2 shadow-lg rounded-lg flex justify-between sm:justify-center items-center border"
          >
            <div className="flex-1">
              <div className="flex items-center mb-3 sm:mb-5">
                <Image
                  src={formatTeamNameToImagePath(match.home)}
                  width={24}
                  height={24}
                  alt={match.home}
                  className="mr-2 sm:ml-4 sm:mr-4"
                />

                <span className="text-sm font-semibold sm:text-base md:text-xl">{match.home}</span>
              </div>

              <div className="flex items-center ">
                <Image
                  src={formatTeamNameToImagePath(match.away)}
                  width={24}
                  height={24}
                  alt={match.away}
                  className="mr-2 sm:ml-4 sm:mr-4"
                />
                <span className="text-sm font-semibold sm:text-base  md:text-xl">{match.away}</span>
              </div>
            </div>
            <div className="border-l-2 border-gray-300 h-10"></div>
            <div className="pl-4 text-sm font-semibold sm:text-base  md:text-xl">{match.time}</div>
          </div>
        ))}
      </div>
    </>
  );
}
