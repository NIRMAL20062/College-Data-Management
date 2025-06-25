
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
  // This state is crucial to prevent race conditions.
  // It ensures we wait for any ongoing redirect to finish.
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

  // Effect 1: On initial mount, check if we're coming back from a Google Sign-In.
  useEffect(() => {
    const processRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // If we have a result, it means a sign-in was successful.
          // The `onAuthStateChanged` listener in `useAuth` will now take over
          // to set the user state and handle Firestore profile creation.
          toast({
            title: "Sign-In Successful",
            description: "Welcome back! Redirecting to your dashboard...",
          });
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
        // No matter the outcome, we've finished processing the redirect.
        setIsProcessingRedirect(false);
      }
    };

    processRedirectResult();
  }, [toast]);

  // Effect 2: This effect handles redirecting the user to the dashboard if they are logged in.
  useEffect(() => {
    // We only redirect IF:
    // 1. We are NOT busy processing a redirect result.
    // 2. The main auth state from our hook is no longer loading.
    // 3. A user object actually exists.
    if (!isProcessingRedirect && !authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, isProcessingRedirect, router]);

  // We show a loader screen while we are processing the redirect,
  // while the main auth hook is loading, or if the user is logged in
  // and we are in the process of redirecting them. This prevents flashes of content.
  const showLoader = isProcessingRedirect || authLoading || user;

  if (showLoader) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Finalizing authentication...</p>
      </div>
    );
  }

  // If all checks are done and there's no user, show the login page.
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
