// src/app/page.tsx
'use client'

import { useEffect, useState } from "react";
import Link from "next/link"
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form"
import { Logo } from "@/components/logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User signed in successfully.
          // The onAuthStateChanged listener in useAuth will handle the user state update.
          toast({
            title: "Sign-In Successful",
            description: "Welcome back! Redirecting to your dashboard...",
          });
        }
      } catch (error: any) {
        toast({
          title: "Sign-In Failed",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsCheckingRedirect(false);
      }
    };
    checkRedirectResult();
  }, [toast]);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user || isCheckingRedirect) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
