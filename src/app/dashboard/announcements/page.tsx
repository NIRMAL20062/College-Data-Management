import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pin } from "lucide-react";

const announcements = [
  { pinned: true, title: "Important: Campus Closure Notice", date: "2024-05-18", content: "The campus will be closed on Monday due to a public holiday. All classes are cancelled." },
  { pinned: false, title: "Mid-term Exam Schedule", date: "2024-05-20", content: "The schedule for mid-term exams has been posted. Please check the student portal for your specific dates and times." },
  { pinned: false, title: "Library Books Return", date: "2024-05-17", content: "All borrowed library books must be returned by the end of this week to avoid fines. The library will be open until 8 PM." },
  { pinned: false, title: "Guest Lecture: AI in Healthcare", date: "2024-05-15", content: "Join us for an exciting guest lecture by Dr. Evelyn Reed on the impact of Artificial Intelligence in modern healthcare. Wednesday at 3 PM in the main auditorium." },
];


export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Announcements</CardTitle>
                <CardDescription>Stay up-to-date with bulletins and important messages.</CardDescription>
            </CardHeader>
        </Card>

        {/* Pinned Announcements */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Pin className="text-primary"/> Pinned</h2>
            {announcements.filter(a => a.pinned).map((announcement, index) => (
                <Card key={`pinned-${index}`} className="border-l-4 border-primary">
                    <CardHeader>
                        <CardTitle>{announcement.title}</CardTitle>
                        <CardDescription>{announcement.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{announcement.content}</p>
                    </CardContent>
                </Card>
            ))}
        </div>

        {/* Regular Announcements */}
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Announcements</h2>
            {announcements.filter(a => !a.pinned).map((announcement, index) => (
                <Card key={`regular-${index}`}>
                    <CardHeader>
                        <CardTitle>{announcement.title}</CardTitle>
                        <CardDescription>{announcement.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{announcement.content}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  )
}
