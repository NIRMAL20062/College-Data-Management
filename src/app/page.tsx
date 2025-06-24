
'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRedirectResult } from "firebase/auth";
import { Loader2, GraduationCap } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form"
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // This effect handles the result of a Google Sign-In redirect.
  // It should only run once on component mount.
  useEffect(() => {
    const checkRedirect = async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                // This means the redirect sign-in was successful.
                // The `onAuthStateChanged` listener in useAuth will handle the user state update.
                toast({
                    title: "Sign-In Successful",
                    description: "Welcome back! Redirecting to your dashboard...",
                });
            }
        } catch (error: any) {
            console.error("Google Sign-In Error:", error);
            let description = "An unknown error occurred during sign-in.";
            if (error.code === 'auth/account-exists-with-different-credential') {
                description = "An account already exists with the same email. Try signing in with the original method.";
            } else if (error.message) {
                description = error.message;
            }
            toast({
                title: "Sign-In Failed",
                description: description,
                variant: "destructive",
            });
        }
    };
    checkRedirect();
  }, [toast]);

  // This effect redirects the user to the dashboard if they are logged in.
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Show a loading spinner while the auth state is being determined,
  // or if the user is logged in and we are about to redirect.
  if (loading || user) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If not loading and no user, show the login page.
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
  )
}
