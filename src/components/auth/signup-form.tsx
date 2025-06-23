
"use client"

import { useState } from "react"
import { signInWithRedirect, GoogleAuthProvider } from "firebase/auth"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { auth } from "@/lib/firebase"

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
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignUp() {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // The user will be redirected to Google, and then back to the login page
      // where the getRedirectResult hook will handle the user session.
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
      <Button variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <GoogleIcon className="mr-2 h-4 w-4" />}
        Sign Up with Google
      </Button>
    </div>
  )
}
