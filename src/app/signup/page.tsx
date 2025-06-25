
'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRedirectResult } from "firebase/auth";
import { Loader2, GraduationCap } from "lucide-react";

import { SignUpForm } from "@/components/auth/signup-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

export default function SignUpPage() {
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
            title: "Sign-Up Successful",
            description: "Welcome! We're setting up your account...",
          });
        }
      } catch (error: any) {
        console.error("Google Sign-Up Redirect Error:", error);
        let description = "An unknown error occurred during sign-up.";
        if (error.code === 'auth/account-exists-with-different-credential') {
          description = "An account already exists with this email. Try signing in with the original method.";
        }
        toast({
          title: "Sign-Up Failed",
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

  if (showLoader) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Finalizing authentication...</p>
      </div>
    );
  }

  // If a user is somehow already present, the useEffect will redirect them.
  // We only show the signup form if there is no user and we are done loading.
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
  
  // This is a fallback, the redirect should have already happened.
  return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
  );
}
