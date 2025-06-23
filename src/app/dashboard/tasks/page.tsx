import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const tasksBySubject = {
  "Math": [
    { id: "m1", text: "Complete Chapter 5 problem set", done: true },
    { id: "m2", text: "Review notes on differential equations", done: false },
    { id: "m3", text: "Prepare for quiz on Friday", done: false },
  ],
  "Science": [
    { id: "s1", text: "Write lab report for chemistry experiment", done: false },
    { id: "s2", text: "Read Chapter 3 of Biology textbook", done: true },
  ],
  "History": [
    { id: "h1", text: "Outline essay on the French Revolution", done: false },
  ],
};

export default function TasksPage() {
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Task Manager</CardTitle>
                <CardDescription>Keep track of your assignments and to-dos.</CardDescription>
            </CardHeader>
        </Card>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(tasksBySubject).map(([subject, tasks]) => (
            <Card key={subject}>
            <CardHeader>
                <CardTitle>{subject}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {tasks.map(task => (
                <div key={task.id} className="flex items-center space-x-3">
                    <Checkbox id={task.id} checked={task.done} />
                    <Label htmlFor={task.id} className={`flex-1 ${task.done ? 'line-through text-muted-foreground' : ''}`}>
                    {task.text}
                    </Label>
                </div>
                ))}
            </CardContent>
            </Card>
        ))}
        </div>
    </div>
  )
}
