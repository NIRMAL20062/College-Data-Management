
"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/firebase"
import { privilegedEmails } from "@/lib/privileged-users"

function GoogleIcon() {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2">
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-4.25 1.62-5.03 0-9.1-3.9-9.1-8.8s4.07-8.8 9.1-8.8c2.8 0 4.3.88 5.7 2.23l2.42-2.33C18.57 1.94 15.82 0 12.48 0 5.88 0 0 5.58 0 12s5.88 12 12.48 12c7.25 0 12.08-4.76 12.08-11.8 0-.66-.07-1.34-.2-2.02z" />
    </svg>
  );
}

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});


export function SignUpForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const email = values.email.toLowerCase();
    const emailDomain = email.split('@')[1];
    const isWhitelisted = privilegedEmails.includes(email);

    if (emailDomain !== 'sitare.org' && !isWhitelisted) {
        toast({
            title: "Sign Up Forbidden",
            description: "You are not from Sitare University.",
            variant: "destructive",
        });
        setLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      toast({
        title: "Verification Email Sent",
        description: "Your account has been created. Please check your inbox to verify your email before logging in.",
      });
      form.reset();
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast({
          title: "Sign Up Failed",
          description: "This email is already in use. Please log in.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign Up Failed",
          description: "Could not create account. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
        setLoading(false);
    }
  }


  async function handleGoogleSignUp() {
    setIsGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      window.location.href = '/dashboard';
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({
            title: "Google Sign-Up Failed",
            description: "Could not complete Google Sign-Up. Please try again.",
            variant: "destructive",
        });
      }
      setIsGoogleLoading(false);
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
                  <Input placeholder="student@sitare.org" {...field} disabled={isAnyLoading} />
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
                  <Input type="password" placeholder="••••••••" {...field} disabled={isAnyLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isAnyLoading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
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
      <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isAnyLoading}>
        {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <GoogleIcon />}
        Sign up with Google
      </Button>
    </div>
  )
}
