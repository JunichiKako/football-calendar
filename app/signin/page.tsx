import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <>
      <div className="flex flex-col md:flex-row items-center lg:h-dvh gap-4">
        <div className="flex-1 px-8 mt-10">
          <div className="relative inline-block mb-8">
            <span className="absolute inset-0 bg-[#63b0fd] rounded-md transform translate-x-2 translate-y-2"></span>
            <div className="relative px-10 py-2 bg-white dark:text-black  border rounded-md">
              <h1 className="text-2xl font-bold">Sign in</h1>
            </div>
          </div>
          <p className="mb-4 ">
            自分だけのスケジュールを作成して、Googleカレンダーに追加できます。
          </p>
          <div className="">
            <Button asChild className="">
              <Link href={"/"}>デモを見る</Link>
            </Button>
          </div>
          <Image src={"/cheer-ontv.png"} width={760} height={600} alt="" />
        </div>
        <div className="flex flex-col text-background bg-[#63b0fd] md:h-dvh w-full max-w-lg justify-center rounded-md p-8 flex-1">
          <div className="space-y-4 z-10 w-full relative">
            <div className="">
              <h1 className="w-full text-xl font-bold ">Welcome!!</h1>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-sm" htmlFor="email">
                  メールアドレス
                </label>
                <Input type="email" placeholder="xx@xx.com" />
              </div>
              <div>
                <label className="text-sm" htmlFor="password">
                  パスワード
                </label>
                <Input type="password" placeholder="" />
              </div>
              <div className="">
                <Button>登録する</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
