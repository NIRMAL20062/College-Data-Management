import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectChart } from "@/components/progress/subject-chart";
import { TimeChart } from "@/components/progress/time-chart";

const subjectPerformanceData = [
  { subject: 'Math', score: 85, fill: "hsl(var(--chart-1))" },
  { subject: 'Science', score: 92, fill: "hsl(var(--chart-2))" },
  { subject: 'History', score: 78, fill: "hsl(var(--chart-3))" },
  { subject: 'English', score: 88, fill: "hsl(var(--chart-4))" },
  { subject: 'Art', score: 95, fill: "hsl(var(--chart-5))" },
];

const progressOverTimeData = [
  { date: 'Jan', score: 75 },
  { date: 'Feb', score: 78 },
  { date: 'Mar', score: 85 },
  { date: 'Apr', score: 82 },
  { date: 'May', score: 88 },
  { date: 'Jun', score: 91 },
];

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Subject</CardTitle>
            <CardDescription>A breakdown of your latest scores in each subject.</CardDescription>
          </CardHeader>
          <CardContent>
            <SubjectChart data={subjectPerformanceData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
            <CardDescription>Your average score trend over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeChart data={progressOverTimeData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
