import Image from "next/image";

export default function SpMatchcard() {
    return (
        <div className="px-4">
            <div className="py-4 px-4 mt-4 shadow-lg rounded-lg flex items-center justify-center border ">
                <div className="flex items-center justify-center gap-3 sm:gap-6">
                    {/* Arsenal */}
                    <div className="flex justify-center items-center flex-wrap gap-1">
                        <span className="text-xs font-semibold mr-2">
                            Arsenal
                        </span>
                        <Image
                            src="/images/arsenal.png"
                            width={20}
                            height={20}
                            alt="Arsenal"
                        />
                    </div>
                    <div className=" text-xs border px-1.5 rounded-md sm:text-xs sm:px-2">
                        vs
                    </div>
                    {/* Manchester City */}
                    <div className="flex justify-center items-center flex-wrap-reverse gap-1">
                        <Image
                            src="/images/manchestercity.png"
                            width={20}
                            height={20}
                            alt="Manchester City"
                        />
                        {/* 長い名前のチームは関数で略称をつけとく？ */}
                        <span className="text-xs font-semibold ml-2">
                            Man City
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
