import Image from "next/image";

export default function MatchCard() {
    return (
        <div className="p-6 mt-4 shadow-lg rounded-lg flex items-center justify-between">
            <div className="flex flex-col gap-2 items-start justify-center">
                <div className="flex items-center mb-2">
                    {" "}
                    {/* Arsenal */}
                    <Image
                        src="/images/arsenal.png"
                        width={24}
                        height={24}
                        alt="Arsenal"
                        className="mr-2"
                    />
                    <span className="text-sm font-semibold">Arsenal</span>
                </div>
                <div className="flex items-center">
                    {" "}
                    {/* Manchester City */}
                    <Image
                        src="/images/manchestercity.png"
                        width={24}
                        height={24}
                        alt="Manchester City"
                        className="mr-2"
                    />
                    <span className="text-sm font-semibold">
                        Manchester City
                    </span>
                </div>
            </div>
            <div className="border-l-2 border-gray-100 h-full my-2 ml-8"></div>
            <div className="text-lg font-semibold ml-4">25:00</div>
        </div>
    );
}
