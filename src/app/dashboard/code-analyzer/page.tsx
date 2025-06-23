import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyzerInterface } from "@/components/code-analyzer/analyzer-interface";

export default function CodeAnalyzerPage() {
  return (
    <div>
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Code Complexity Analyzer</CardTitle>
                <CardDescription>Paste your code snippet below to get its time complexity analysis.</CardDescription>
            </CardHeader>
        </Card>
        <AnalyzerInterface />
    </div>
  );
}
