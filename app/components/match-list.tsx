import Image from "next/image";
import MatchCard from "./match-card";

export default function MatchList() {
    return (
        <div className="mt-2 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
                <Image
                    src="/images/premierleague.png"
                    width={90}
                    height={40}
                    alt="Premier League"
                    className="dark:grayscale dark:invert"
                />
                <div className="mt-6 text-center w-full">
                    <p className="text-lg font-semibold border-b inline-block">
                        2024.05.06 (土)
                    </p>
                </div>
                <MatchCard />
                <MatchCard />
                <MatchCard />
                <MatchCard />
                <MatchCard />
            </div>
            <div className="flex flex-col items-center ">
                <Image
                    src="/images/bundesliga.png"
                    width={90}
                    height={40}
                    alt="Bundesliga"
                />
                <div className="mt-6 text-center w-full">
                    <p className="text-lg font-semibold border-b inline-block">
                        2024.05.06 (土)
                    </p>
                </div>
                <MatchCard />
                <MatchCard />
                <MatchCard />
            </div>
            <div className="flex flex-col items-center ">
                <Image
                    src="/images/seriea.png"
                    width={90}
                    height={40}
                    alt="Serie A"
                />
                <div className="mt-6 text-center w-full">
                    <p className="text-lg font-semibold border-b inline-block">
                        2024.05.06 (土)
                    </p>
                </div>
                <MatchCard />
                <MatchCard />
                <MatchCard />
            </div>
        </div>
    );
}
