"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();
  return (
    <Button variant="outline" onClick={() => router.push("/")}>
      Back
    </Button>
  );
}
