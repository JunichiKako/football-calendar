"use client";

import { CircleUser, LogOut, LogOutIcon, Settings, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SignOutButton } from "@clerk/nextjs";

type UserImageProps = {
  imageUrl: string | undefined;
};

export default function UserMenu({ imageUrl }: UserImageProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Avatar>
            <AvatarImage src={imageUrl} alt="@shadcn" />
            {/* アバターの初期画像は人のアイコンでもいいかも */}
            <AvatarFallback>
              <CircleUser size="icon" className="text-gray-400" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <DropdownMenuLabel>アカウント情報</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <a target="_blank" href="https://delicate-urchin-20.accounts.dev/user?=redirect_url=/">
              <span>Profile</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LogOutIcon className="mr-2 h-4 w-4" />
            <SignOutButton redirectUrl="/">
              Logout
            </SignOutButton>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
