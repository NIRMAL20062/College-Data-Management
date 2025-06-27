
'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, GraduationCap } from "lucide-react";
import { getRedirectResult, GithubAuthProvider, type AuthCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [redirectLoading, setRedirectLoading] = useState(true);
  const [pendingCredential, setPendingCredential] = useState<AuthCredential | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs only once on mount to check for a redirect result.
    getRedirectResult(auth)
      .then((result) => {
        // If result is not null, it means the user just signed in via redirect.
        // The onAuthStateChanged listener in useAuth will then handle routing to the dashboard.
        if (result) {
            // Successfully signed in.
        }
      })
      .catch((error) => {
        // Handle the specific error where the user has an account with the same email
        // but a different provider (e.g., password).
        if (error.code === 'auth/account-exists-with-different-credential') {
          // Get the credential from the error to prepare for linking.
          const credential = GithubAuthProvider.credentialFromError(error);
          const email = error.customData.email;
          setPendingCredential(credential);
          setPendingEmail(email);
          toast({
            title: "Link Your Account",
            description: "An account with this email already exists. Please sign in with your password to link your GitHub account.",
            variant: "default",
            duration: 7000,
          });
        } else {
          // Handle other potential errors from the redirect.
          console.error("Auth redirect error:", error);
          toast({
            title: "Sign-In Failed",
            description: "Could not complete the sign-in process. Please try again.",
            variant: "destructive",
          });
        }
      })
      .finally(() => {
        // Stop the redirect-specific loading indicator.
        setRedirectLoading(false);
      });
  }, [toast]);

  useEffect(() => {
    // This effect handles redirecting the user to the dashboard once they are logged in.
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [authLoading, user, router]);
  
  const loading = authLoading || redirectLoading;

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
              <LoginForm pendingCredential={pendingCredential} pendingEmail={pendingEmail} />
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
