
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
          <CardDescription>
            Stay updated with the latest news. Go to the{" "}
            <Link href="/dashboard/announcements" className="text-primary hover:underline">Announcements</Link>
            {" "}page to see all messages.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-10">
            <p className="text-muted-foreground">Recent announcements will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
