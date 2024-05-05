import Image from "next/image";

export default function MatchCard() {
    return (
        <div className="p-5 mt-4 shadow-lg rounded-lg flex items-center justify-between border">
            <div className="flex flex-col gap-2 items-start justify-center">
                <div className="flex flexwrap items-center mb-2">
                    {/* Arsenal */}
                    <Image
                        src="/images/arsenal.png"
                        width={24}
                        height={24}
                        alt="Arsenal"
                        className="mr-2"
                    />
                    <span className="text-xs font-semibold">Arsenal</span>
                </div>
                <div className="flex items-center">
                    {/* Manchester City */}
                    <Image
                        src="/images/manchestercity.png"
                        width={24}
                        height={24}
                        alt="Manchester City"
                        className="mr-2"
                    />
                    <span className="text-xs font-semibold">
                        Manchester City
                    </span>
                </div>
            </div>
            <div className="border-l-2 border h-full my-2 ml-8 mr-4"></div>
            <div className="font-semibold">25:00</div>
        </div>
    );
}
