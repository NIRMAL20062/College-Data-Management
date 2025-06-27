
'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, GraduationCap } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // This effect handles redirecting the user to the dashboard once they are logged in.
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [authLoading, user, router]);
  
  const loading = authLoading;

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
          <div className="hidden bg-muted lg:flex lg:flex-col lg:items-center lg:justify-center p-12 text-center">
            <div className="mx-auto w-[350px] space-y-4">
                <GraduationCap className="h-16 w-16 text-primary mx-auto" />
                <h1 className="text-3xl font-bold">Welcome to AcademIQ</h1>
                <p className="text-balance text-muted-foreground">
                  Your all-in-one platform for academic success. Track exams, manage tasks, and get AI-powered help.
                </p>
            </div>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Login</h1>
                <p className="text-balance text-muted-foreground">
                  Enter your credentials to access your dashboard
                </p>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      );
  }

  // Fallback loader while redirecting after login.
  return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
  );
}
