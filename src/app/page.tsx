
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
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  useEffect(() => {
    const processRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          toast({
            title: "Sign-In Successful",
            description: "Welcome back! Redirecting to your dashboard...",
          });
          // The onAuthStateChanged listener in useAuth will handle the user state.
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
        setIsProcessingRedirect(false);
      }
    };

    processRedirectResult();
  }, [toast]);

  useEffect(() => {
    // Redirect if the user is logged in and all loading is complete.
    if (!authLoading && !isProcessingRedirect && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, isProcessingRedirect, router]);

  // The loader should only be shown while auth state is being determined
  // or a redirect is being processed.
  const showLoader = authLoading || isProcessingRedirect;

  // If we're done loading and there's no user, show the login page.
  if (showLoader) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Finalizing authentication...</p>
      </div>
    );
  }

  // If a user is somehow already present, the useEffect will redirect them.
  // We only show the login form if there is no user and we are done loading.
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

  // This is a fallback, the redirect should have already happened.
  return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
  );
}
