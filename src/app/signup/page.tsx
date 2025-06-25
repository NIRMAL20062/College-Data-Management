
'use client'

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, GraduationCap } from "lucide-react";

import { SignUpForm } from "@/components/auth/signup-form";
import { useAuth } from "@/hooks/use-auth";

export default function SignUpPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

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
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Create an account</h1>
                <p className="text-balance text-muted-foreground">
                  Enter your information to get started
                </p>
              </div>
              <SignUpForm />
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/" className="underline">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden bg-muted lg:flex lg:flex-col lg:items-center lg:justify-center p-12 text-center">
            <div className="mx-auto w-[350px] space-y-4">
                <GraduationCap className="h-16 w-16 text-primary mx-auto" />
                <h1 className="text-3xl font-bold">Unlock Your Potential</h1>
                <p className="text-balance text-muted-foreground">
                  Join thousands of students succeeding with AcademIQ. Your journey starts here.
                </p>
            </div>
          </div>
        </div>
      );
  }
  
  // Fallback loader for redirecting
  return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
  );
}
