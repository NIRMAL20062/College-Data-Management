"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithRedirect, GoogleAuthProvider } from "firebase/auth"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/firebase"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.94 11.06A9.993 9.993 0 0 0 12 2C6.477 2 2 6.477 2 12s4.477 10 10 10c2.47 0 4.75-.88 6.54-2.35" />
      <path d="M21.99 12H12" />
      <path d="M22 12a10 10 0 0 1-5.46 9.06" />
      <path d="M12 2a10 10 0 0 1 9.06 5.46" />
      <path d="M12 22a10 10 0 0 0 9.06-14.54" />
    </svg>
  );
}

export function SignUpForm() {
  const { toast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Account Created!",
        description: "Redirecting to your new dashboard...",
      });
      router.push("/dashboard");
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use. Please try logging in.";
      }
      toast({
        title: "Sign-Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // The user will be redirected, so the rest of the code won't execute here.
      // The result is handled on the login page after redirect.
    } catch (error: any) {
      toast({
        title: "Google Sign-Up Failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="student@example.com" {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <GoogleIcon className="mr-2 h-4 w-4" />}
        Sign Up with Google
      </Button>
    </div>
  )
}
