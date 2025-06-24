
'use client'

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRedirectResult } from "firebase/auth";
import { Loader2, GraduationCap } from "lucide-react";

import { SignUpForm } from "@/components/auth/signup-form";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

export default function SignUpPage() {
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
                // This means the redirect sign-up was successful.
                // The `onAuthStateChanged` listener in useAuth will handle user creation and state update.
                toast({
                    title: "Sign-Up Successful",
                    description: "Welcome! We're setting up your account...",
                });
            }
        } catch (error: any) {
            console.error("Google Sign-Up Error:", error);
            let description = "An unknown error occurred during sign-up.";
            if (error.code === 'auth/account-exists-with-different-credential') {
                description = "An account already exists with the same email. Try signing in with the original method.";
            } else if (error.message) {
                description = error.message;
            }
            toast({
                title: "Sign-Up Failed",
                description: description,
                variant: "destructive",
            });
        }
    };
    checkRedirect();
  }, [toast]);

  // Redirects if user is already logged in.
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);
  
  // Show loader while checking auth state or if we are about to redirect.
  if (loading || user) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
  )
}
