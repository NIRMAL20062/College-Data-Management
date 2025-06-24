"use client"

import { useState, type FormEvent } from "react"
import { debugCode, type DebugCodeOutput } from "@/ai/flows/code-debugger"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, BugPlay, CheckCircle, AlertTriangle, Lightbulb, Code } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const placeholderCode = `function factorial(n) {
  if (n = 0) {
    return 1;
  } else {
    return n * factorial(n - 1);
  }
}`;


export function DebuggerInterface() {
  const [code, setCode] = useState(placeholderCode)
  const [result, setResult] = useState<DebugCodeOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDebug = async (e: FormEvent) => {
    e.preventDefault()
    if (!code) return
    setLoading(true)
    setResult(null)
    setError(null)
    
    try {
      const analysis = await debugCode({ codeSnippet: code })
      setResult(analysis)
    } catch (err) {
      console.error(err)
      setError("Failed to debug code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
            <CardTitle>Your Code</CardTitle>
            <CardDescription>Enter the code snippet you want to debug.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDebug} className="space-y-4">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code snippet here"
              rows={15}
              className="font-mono text-sm"
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BugPlay className="mr-2 h-4 w-4" />
              )}
              Debug Code
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>The AI's analysis will appear below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          {result && (
            result.isBugFree ? (
                <Alert variant="default" className="border-green-500/50 text-green-700 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 !text-green-500" />
                    <AlertTitle>No Bugs Found!</AlertTitle>
                    <AlertDescription>
                        {result.explanation}
                    </AlertDescription>
                </Alert>
            ) : (
                 <div className="space-y-6">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Bug Found</AlertTitle>
                        <AlertDescription>
                            {result.bug}
                        </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4"/>Explanation</h3>
                        <p className="text-sm text-muted-foreground">{result.explanation}</p>
                    </div>

                    <div className="space-y-2">
                         <h3 className="font-semibold flex items-center gap-2"><Code className="h-4 w-4"/>Corrected Code</h3>
                         <div className="rounded-md bg-muted p-4">
                            <pre className="text-sm font-mono whitespace-pre-wrap">
                                <code>{result.fixedCode}</code>
                            </pre>
                         </div>
                    </div>

                </div>
            )
          )}
          {!loading && !result && !error && (
            <div className="text-center text-muted-foreground py-10">
                <p>Debugging results will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
