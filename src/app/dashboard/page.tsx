
'use client'

import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, BarChart2, BookOpen, ClipboardList, Loader2, TrendingUp, TrendingDown } from "lucide-react"
import Link from "next/link"
import { MotivationalGreeting } from "@/components/dashboard/motivational-greeting"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, limit, onSnapshot, Timestamp, getDocs } from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"

type Announcement = {
  id: string;
  title: string;
  content: string;
  date: Timestamp;
}

type Exam = {
    id: string;
    obtained: number;
    total: number;
};

type Task = {
    id: string;
    done: boolean;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  const [examStats, setExamStats] = useState({ average: 0, count: 0, trend: 0 });
  const [loadingExams, setLoadingExams] = useState(true);

  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Fetch Announcements
  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("date", "desc"), limit(3));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const announcementsData: Announcement[] = [];
        querySnapshot.forEach((doc) => {
          announcementsData.push({ id: doc.id, ...doc.data() } as Announcement);
        });
        setRecentAnnouncements(announcementsData);
        setLoadingAnnouncements(false);
    }, (error) => {
        console.error("Error fetching recent announcements: ", error);
        setLoadingAnnouncements(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Exams and Tasks Data
  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
        // Fetch Exams
        setLoadingExams(true);
        const examsQuery = query(collection(db, `users/${user.uid}/exams`), orderBy("date", "desc"));
        const examSnapshot = await getDocs(examsQuery);
        const examsData = examSnapshot.docs.map(doc => doc.data() as Exam);
        
        if (examsData.length > 0) {
            const totalPercentage = examsData.reduce((acc, exam) => acc + (exam.obtained / exam.total) * 100, 0);
            const average = totalPercentage / examsData.length;
            
            let trend = 0;
            if(examsData.length > 1) {
                const latestExamPercentage = (examsData[0].obtained / examsData[0].total) * 100;
                const previousExams = examsData.slice(1);
                const previousTotalPercentage = previousExams.reduce((acc, exam) => acc + (exam.obtained / exam.total) * 100, 0);
                const previousAverage = previousTotalPercentage / previousExams.length;
                trend = latestExamPercentage - previousAverage;
            }
            setExamStats({ average, count: examsData.length, trend });
        }
        setLoadingExams(false);

        // Fetch Tasks
        setLoadingTasks(true);
        const tasksQuery = query(collection(db, `users/${user.uid}/tasks`));
        const taskSnapshot = await getDocs(tasksQuery);
        const tasksData = taskSnapshot.docs.map(doc => doc.data() as Task);
        const completedTasks = tasksData.filter(task => task.done).length;
        setTaskStats({ completed: completedTasks, total: tasksData.length });
        setLoadingTasks(false);
    };

    fetchDashboardData();
  }, [user]);

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "a moment ago";
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const TrendIndicator = ({ trend }: { trend: number }) => {
      if (trend === 0) return null;
      const isPositive = trend > 0;
      return (
          <p className={`text-xs text-muted-foreground flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4 mr-1"/> : <TrendingDown className="h-4 w-4 mr-1"/>}
              {isPositive ? '+' : ''}{trend.toFixed(1)}% from previous average
          </p>
      );
  }
  
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
            {loadingExams ? <Skeleton className="h-10 w-3/4" /> : (
                <>
                    <div className="text-2xl font-bold">{examStats.average.toFixed(1)}%</div>
                    <TrendIndicator trend={examStats.trend} />
                </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exams Taken</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingExams ? <Skeleton className="h-10 w-1/2" /> : (
                <>
                    <div className="text-2xl font-bold">{examStats.count}</div>
                    <p className="text-xs text-muted-foreground">Total exams recorded</p>
                </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingTasks ? <Skeleton className="h-10 w-3/4" /> : (
                <>
                    <div className="text-2xl font-bold">{taskStats.completed}/{taskStats.total}</div>
                    <p className="text-xs text-muted-foreground">
                        {taskStats.total - taskStats.completed > 0 ? `${taskStats.total - taskStats.completed} tasks remaining` : "All tasks done!"}
                    </p>
                </>
            )}
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
        <CardContent className="space-y-4">
          {loadingAnnouncements ? (
             <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentAnnouncements.length > 0 ? (
            recentAnnouncements.map(announcement => (
              <div key={announcement.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <h4 className="font-semibold">{announcement.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">Posted on {formatDate(announcement.date)}</p>
                  <p className="text-sm line-clamp-2">{announcement.content}</p>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center p-10">
                <p className="text-muted-foreground">No recent announcements.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

    