
'use client'

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, BarChart2, BookOpen, ClipboardList, Loader2 } from "lucide-react"
import Link from "next/link"
import { MotivationalGreeting } from "@/components/dashboard/motivational-greeting"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, limit, getDocs, Timestamp } from "firebase/firestore"

type Announcement = {
  id: string;
  title: string;
  content: string;
  date: Timestamp;
}

export default function DashboardPage() {
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    const fetchRecentAnnouncements = async () => {
      try {
        const q = query(collection(db, "announcements"), orderBy("date", "desc"), limit(3));
        const querySnapshot = await getDocs(q);
        const announcementsData: Announcement[] = [];
        querySnapshot.forEach((doc) => {
          announcementsData.push({ id: doc.id, ...doc.data() } as Announcement);
        });
        setRecentAnnouncements(announcementsData);
      } catch (error) {
        console.error("Error fetching recent announcements: ", error);
      } finally {
        setLoadingAnnouncements(false);
      }
    };
    fetchRecentAnnouncements();
  }, []);

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "a moment ago";
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
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
