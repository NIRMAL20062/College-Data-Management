
"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { signInWithEmailAndPassword, GithubAuthProvider, linkWithCredential, type AuthCredential, signInWithPopup } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>GitHub</title>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

export function LoginForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [pendingCredential, setPendingCredential] = useState<AuthCredential | null>(null);

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      
      if (pendingCredential) {
        await linkWithCredential(userCredential.user, pendingCredential);
        toast({
          title: "Account Linked!",
          description: "Your GitHub account has been successfully linked. You can now sign in with either method.",
        });
        setPendingCredential(null);
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
        setLoading(false);
    }
  }

  async function handleGitHubSignIn() {
    setLoading(true);
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // On success, force a page reload. This ensures the app correctly
      // picks up the new auth state, especially in tricky iframe environments.
      window.location.reload();
    } catch (error: any) {
      switch (error.code) {
        case 'auth/popup-blocked':
          toast({
            title: "Pop-up Blocked",
            description: "Your browser blocked the login pop-up. Please allow pop-ups for this site and try again.",
            variant: "destructive",
            duration: 7000,
          });
          break;
        case 'auth/cancelled-popup-request':
        case 'auth/popup-closed-by-user':
          // User closed the pop-up, this is not an error.
          break;
        case 'auth/account-exists-with-different-credential':
          const credential = GithubAuthProvider.credentialFromError(error);
          const email = error.customData.email;
          setPendingCredential(credential);
          form.setValue('email', email);
          toast({
            title: "Link Your Account",
            description: "This email is already registered. Please enter your password to link your GitHub account.",
            variant: "default",
            duration: 7000,
          });
          break;
        default:
          console.error("GitHub Sign-In Error:", error);
          toast({
            title: "GitHub Sign-In Failed",
            description: "An unexpected error occurred. Please try again.",
            variant: "destructive",
          });
          break;
      }
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
                  <Input placeholder="student@example.com" {...field} disabled={loading || !!pendingCredential}/>
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
            {pendingCredential ? "Link Account & Login" : "Login"}
          </Button>
        </form>
      </Form>
       <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
            Or continue with
        </span>
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={handleGitHubSignIn} disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GithubIcon className="mr-2 h-4 w-4" />}
        GitHub
      </Button>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline" aria-disabled={loading}>
          Sign up
        </Link>
      </div>
    </div>
  )
}
