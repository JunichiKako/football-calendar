import Image from "next/image";
import { cn } from "@/lib/utils";

interface TeamLabelProps {
  imageURL: string;
  name: string;
}

export const TeamLabel: React.FC<TeamLabelProps> = ({ imageURL, name }) => {
  const isJuventus = name === "ユベントス";

  return (
    <div className="flex items-center">
      <Image
        src={imageURL}
        width={24}
        height={24}
        alt={name}
        className={cn("size-6 mr-2 rounded-sm", {
          "Juventus-logo": isJuventus,
        })}
      />
      <p className="text-sm">{name}</p>
    </div>
  );
};