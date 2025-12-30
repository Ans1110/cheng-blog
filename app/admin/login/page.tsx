"use client";

import useAdminAuth from "@/hooks/useAdminAuth";
import { LoginInput, loginSchema } from "@/utils/validation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import { ControlledInput } from "@/components/ui/controlled-input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAdminAuth(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      password: "",
    },
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  useEffect(() => {
    if (isAuthenticated) router.push("/admin");
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginInput) => {
    const success = await login(data.password);
    if (success) {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto mb-2 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
            <Lock className="size-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription className="text-base">
            Enter your password to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <ControlledInput
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 text-base"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
