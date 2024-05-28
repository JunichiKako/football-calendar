"use client";

import { createProfile } from "@/actions/action";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

type FormType = {
  name: string;
};

export default function ProfileForm() {
  const form = useForm<FormType>({
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: FormType) => {
    console.log("Formdata", data);

    createProfile(data.name).then(() => {
      form.reset();
      alert("プロフィールを作成しました！");
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <Label>名前</Label>
              <Input autoComplete="off" {...field} />
            </FormItem>
          )}
        />

        <Button>送信</Button>
      </form>
    </Form>
  );
}
