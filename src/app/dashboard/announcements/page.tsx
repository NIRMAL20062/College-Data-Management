
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pin, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const initialAnnouncements = [
  { pinned: true, title: "Important: Campus Closure Notice", date: "2024-05-18", content: "The campus will be closed on Monday due to a public holiday. All classes are cancelled." },
  { pinned: false, title: "Mid-term Exam Schedule", date: "2024-05-20", content: "The schedule for mid-term exams has been posted. Please check the student portal for your specific dates and times." },
  { pinned: false, title: "Library Books Return", date: "2024-05-17", content: "All borrowed library books must be returned by the end of this week to avoid fines. The library will be open until 8 PM." },
  { pinned: false, title: "Guest Lecture: AI in Healthcare", date: "2024-05-15", content: "Join us for an exciting guest lecture by Dr. Evelyn Reed on the impact of Artificial Intelligence in modern healthcare. Wednesday at 3 PM in the main auditorium." },
];

export default function AnnouncementsPage() {
  const { isPrivileged } = useAuth();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleAddAnnouncement = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const newAnnouncement = {
      pinned: false,
      title: newTitle,
      content: newContent,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setNewTitle("");
    setNewContent("");
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Announcements</CardTitle>
                <CardDescription>Stay up-to-date with bulletins and important messages.</CardDescription>
            </CardHeader>
             {isPrivileged && (
              <CardContent>
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold">Create New Announcement</h3>
                  <Input 
                    placeholder="Announcement Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <Textarea 
                    placeholder="Announcement Content..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={5}
                  />
                  <Button onClick={handleAddAnnouncement}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Post Announcement
                  </Button>
                </div>
              </CardContent>
            )}
        </Card>

        {announcements.filter(a => a.pinned).length > 0 && (
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
        )}

        {announcements.filter(a => !a.pinned).length > 0 && (
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
        )}
    </div>
  )
}
