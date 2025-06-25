
"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, sendEmailVerification, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

function GoogleIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2">
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-4.25 1.62-5.03 0-9.1-3.9-9.1-8.8s4.07-8.8 9.1-8.8c2.8 0 4.3.88 5.7 2.23l2.42-2.33C18.57 1.94 15.82 0 12.48 0 5.88 0 0 5.58 0 12s5.88 12 12.48 12c7.25 0 12.08-4.76 12.08-11.8 0-.66-.07-1.34-.2-2.02z" />
    </svg>
  );
}

export function LoginForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      if (!userCredential.user.emailVerified) {
        toast({
          title: "Email Not Verified",
          description: "Please check your inbox to verify your email before logging in. A new verification link has been sent.",
          variant: "destructive",
        });
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        setLoading(false);
        return;
      }
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      // After sign-in, check if the email is verified according to our flow.
      if (!userCredential.user.emailVerified) {
        toast({
          title: "Email Not Verified",
          description: "Please check your inbox to verify your email before logging in. A new verification link has been sent.",
          variant: "destructive",
        });
        // We must sign the user out if they aren't verified.
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
      } else {
        // If verified, proceed to dashboard.
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
         toast({
          title: "Google Sign-In Failed",
          description: "Could not complete Google Sign-In. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
        setIsGoogleLoading(false);
    }
  }

  async function handlePasswordReset() {
    const email = form.getValues("email");
    if (!email || form.getFieldState("email").invalid) {
      form.setError("email", { type: "manual", message: "Please enter a valid email to reset password." })
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox for instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Password Reset Failed",
        description: "Could not send reset email. Please check the address and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const isAnyLoading = loading || isGoogleLoading;

  return (
    <div className="grid gap-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="student@example.com" {...field} disabled={isAnyLoading}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>Password</FormLabel>
                  <Button
                      type="button"
                      variant="link"
                      className="ml-auto inline-block h-auto p-0 text-sm underline"
                      onClick={handlePasswordReset}
                      disabled={isAnyLoading}
                  >
                      Forgot your password?
                  </Button>
                </div>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isAnyLoading}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isAnyLoading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isAnyLoading}>
        {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <GoogleIcon />}
        Login with Google
      </Button>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline" aria-disabled={isAnyLoading}>
          Sign up
        </Link>
      </div>
    </div>
  )
}
