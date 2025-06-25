"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { createUserWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/firebase"
import { privilegedEmails } from "@/lib/privileged-users"

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
                  <Input placeholder="student@sitare.org" {...field} disabled={loading} />
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
                  <Input type="password" placeholder="••••••••" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </Form>
    </div>
  )
}
