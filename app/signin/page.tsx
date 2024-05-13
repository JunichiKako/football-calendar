import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function Page() {
    return (
        <div className="px-4 flex flex-col justify-center items-center h-dvh  lg:ml-64">
            <div className="border-2 space-y-4 z-10 bg-card shadow-lg rounded-lg max-w-md w-full relative">
                <div className="bg-foreground rounded-t-md">
                    <h1 className="text-card text-xl font-bold p-2 text-center">
                        Sign in
                    </h1>
                </div>
                <div className="p-4 space-y-6">
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
                    <div className="text-center">
                        <Button>登録する</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
