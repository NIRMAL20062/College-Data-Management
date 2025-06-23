"use client"

import { useState, type FormEvent } from "react"
import { analyzeCodeComplexity, type CodeComplexityOutput } from "@/ai/flows/code-complexity-analyzer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ComplexityChart } from "./complexity-chart"

const placeholderCode = `function example(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}`;


export function AnalyzerInterface() {
  const [code, setCode] = useState(placeholderCode)
  const [result, setResult] = useState<CodeComplexityOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault()
    if (!code) return
    setLoading(true)
    setResult(null)
    setError(null)
    
    try {
      const analysis = await analyzeCodeComplexity({ codeSnippet: code })
      setResult(analysis)
    } catch (err) {
      console.error(err)
      setError("Failed to analyze code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
            <CardTitle>Your Code</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code snippet here"
              rows={15}
              className="font-code text-sm"
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Analyze Complexity
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
          )}
          {error && <p className="text-destructive">{error}</p>}
          {result && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-muted-foreground">Time Complexity</h3>
                <p className="text-2xl font-bold font-code text-primary">{result.timeComplexity}</p>
              </div>
               <div>
                <h3 className="font-semibold text-muted-foreground mb-2">Complexity Graph</h3>
                <ComplexityChart result={result.timeComplexity} />
              </div>
              <div>
                <h3 className="font-semibold text-muted-foreground">Explanation</h3>
                <p className="text-sm">{result.explanation}</p>
              </div>
            </div>
          )}
          {!loading && !result && !error && (
            <div className="text-center text-muted-foreground py-10">
                <p>Analysis results will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
