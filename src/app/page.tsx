
'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRedirectResult } from "firebase/auth";
import { Loader2, GraduationCap } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  useEffect(() => {
    // This effect should only run once on mount to check for a redirect result.
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // A successful sign-in via redirect has occurred.
          // The onAuthStateChanged listener in useAuth will handle the user state update.
          // We can show a toast here for better UX.
          toast({
            title: "Sign-In Successful",
            description: "Welcome back! Redirecting to your dashboard...",
          });
          // The redirect to dashboard will be handled by the other useEffect.
        }
      } catch (error: any) {
        console.error("Google Sign-In Redirect Error:", error);
        let description = "An unknown error occurred during sign-in.";
        if (error.code === 'auth/account-exists-with-different-credential') {
          description = "An account already exists with the same email. Please sign in with your original method.";
        }
        toast({
          title: "Sign-In Failed",
          description: description,
          variant: "destructive",
        });
      } finally {
        // No matter the outcome, we're done checking for the redirect.
        setIsCheckingRedirect(false);
      }
    };

    checkRedirectResult();
  }, [toast]);

  useEffect(() => {
    // This effect handles redirecting the user if they are logged in.
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Show a loading spinner while we are checking for a redirect result,
  // while the main auth hook is loading, or if the user is logged in
  // and we are about to redirect.
  if (isCheckingRedirect || authLoading || user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If we're done with all checks and there's no user, show the login form.
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
