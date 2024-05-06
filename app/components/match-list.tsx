import Image from "next/image";
import MatchCard from "./match-card";
import SpMatchcard from "./sp-matchcard";

export default function MatchList() {
    return (
        <>
            <div className="mt-2 hidden lg:grid lg:grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                    <Image
                        src="/images/premierleague.png"
                        width={90}
                        height={40}
                        alt="Premier League"
                    />

                    <p className="mt-6 text-lg font-semibold border-b inline-block ">
                        2024.05.06 (土)
                    </p>

                    <MatchCard />
                    <MatchCard />
                    <MatchCard />
                </div>

                <div className="flex flex-col items-center">
                    <Image
                        src="/images/bundesliga.png"
                        width={90}
                        height={40}
                        alt="Bundesliga"
                    />
                    <div className="mt-6">
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
            <div className="lg:hidden">
                <div className="flex items-start justify-between gap-4 sticky top-16 bg-card px-4">
                    <Image
                        src="/images/premierleague.png"
                        width={90}
                        height={40}
                        alt=""
                    />
                    <div>
                        <p className="mt-6 text-sm font-semibold border-b">
                            2024.05.06 (土)
                        </p>
                        <p className="text-sm text-center bg-secondary rounded-xl py-1 mt-4">
                            25:00
                        </p>
                    </div>
                </div>
                <SpMatchcard />
                <SpMatchcard />
                <SpMatchcard />
                <SpMatchcard />
                <SpMatchcard />
                <SpMatchcard />
                <SpMatchcard />
                <SpMatchcard />
                <SpMatchcard />
                <SpMatchcard />
                <SpMatchcard />
                <SpMatchcard />
            </div>
        </>
    );
}
