import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DebuggerInterface } from "@/components/code-debugger/debugger-interface";
import { BugPlay } from "lucide-react";

export default function CodeDebuggerPage() {
  return (
    <div>
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BugPlay className="h-6 w-6"/>
                    AI Code Debugger
                </CardTitle>
                <CardDescription>Paste your code to get help identifying bugs and understanding the fix. It's like having a 24/7 TA!</CardDescription>
            </CardHeader>
        </Card>
        <DebuggerInterface />
    </div>
  );
}
