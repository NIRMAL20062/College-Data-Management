"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

export function LoginForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

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
                  <Input placeholder="student@example.com" {...field} disabled={loading}/>
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
                      disabled={loading}
                  >
                      Forgot your password?
                  </Button>
                </div>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={loading}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline" aria-disabled={loading}>
          Sign up
        </Link>
      </div>
    </div>
  )
}
