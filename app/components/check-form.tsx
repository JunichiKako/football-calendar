"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Match } from "@/types/match";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type competitionByGroupProps = {
  [key: string]: {
    competitionId: number;
    competitionName: string;
    competitionImg: string;
    matches: Match[];
  };
};

const FormSchema = z.object({
  competitionName: z.string(),
});

export function CheckForm({ competitionByGroup }: { competitionByGroup: competitionByGroupProps }) {
  const { register, watch } = useForm();

  const { replace } = useRouter();

  const value = watch();

  useEffect(() => {
    const params = new URLSearchParams(value);
    replace(`/competitions?${params.toString()}`);
  }, [value, replace]);

  return (
    <form className="space-y-8">
      {Object.entries(competitionByGroup).map(([key, value]) => {
        const { competitionName } = value;
        return (
          <div key={key}>
            <FormItem className="flex">
              <Label>{competitionName}</Label>
              <Input type="checkbox" {...register} />
            </FormItem>
          </div>
        );
      })}
    </form>
  );
}
