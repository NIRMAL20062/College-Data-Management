import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, BarChart2, BookOpen, ClipboardList } from "lucide-react"
import Link from "next/link"
import { MotivationalGreeting } from "@/components/dashboard/motivational-greeting"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <MotivationalGreeting />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">88.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exams Taken</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 new exams this semester</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25/30</div>
            <p className="text-xs text-muted-foreground">5 tasks remaining this week</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
            </CardHeader>
            <CardContent>
                <Link href="/dashboard/progress">
                    <Button size="sm" className="w-full">
                        View Progress
                        <ArrowUpRight className="h-4 w-4 ml-2"/>
                    </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-2">See your detailed progress graphs</p>
            </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Announcements</CardTitle>
          <CardDescription>Stay updated with the latest news and bulletins.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Mid-term Exam Schedule</h3>
                <span className="text-xs text-muted-foreground">Posted 2 days ago</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">The schedule for mid-term exams has been posted. Please check the 'Announcements' page for full details.</p>
          </div>
          <div className="p-4 rounded-lg border bg-card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Library Books Return</h3>
                <span className="text-xs text-muted-foreground">Posted 5 days ago</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">All borrowed library books must be returned by the end of this week to avoid fines.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
