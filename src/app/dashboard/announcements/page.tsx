
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Pin, PlusCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialAnnouncements = [
  { id: 1, pinned: true, title: "Important: Campus Closure Notice", date: "2024-05-18", content: "The campus will be closed on Monday due to a public holiday. All classes are cancelled." },
  { id: 2, pinned: false, title: "Mid-term Exam Schedule", date: "2024-05-20", content: "The schedule for mid-term exams has been posted. Please check the student portal for your specific dates and times." },
  { id: 3, pinned: false, title: "Library Books Return", date: "2024-05-17", content: "All borrowed library books must be returned by the end of this week to avoid fines. The library will be open until 8 PM." },
  { id: 4, pinned: false, title: "Guest Lecture: AI in Healthcare", date: "2024-05-15", content: "Join us for an exciting guest lecture by Dr. Evelyn Reed on the impact of Artificial Intelligence in modern healthcare. Wednesday at 3 PM in the main auditorium." },
];

type Announcement = typeof initialAnnouncements[0];

export default function AnnouncementsPage() {
  const { isPrivileged } = useAuth();
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  const handleAddAnnouncement = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    const newAnnouncement = {
      id: Date.now(),
      pinned: false,
      title: newTitle,
      content: newContent,
      date: new Date().toISOString().split('T')[0],
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setNewTitle("");
    setNewContent("");
  };

  const handleDeleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const handleEditClick = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setEditingTitle(announcement.title);
    setEditingContent(announcement.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
    setEditingContent("");
  };

  const handleSaveEdit = (id: number) => {
    setAnnouncements(announcements.map(a => 
      a.id === id ? { ...a, title: editingTitle, content: editingContent } : a
    ));
    handleCancelEdit();
  };

  const renderAnnouncementCard = (announcement: Announcement) => {
    const isEditing = editingId === announcement.id;

    return (
        <Card key={announcement.id} className={announcement.pinned ? "border-l-4 border-primary" : ""}>
            {isEditing ? (
                <>
                    <CardHeader>
                        <Input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} className="text-lg font-semibold"/>
                        <CardDescription>{announcement.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} rows={4}/>
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                        <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                        <Button onClick={() => handleSaveEdit(announcement.id)}>Save</Button>
                    </CardFooter>
                </>
            ) : (
                <>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{announcement.title}</CardTitle>
                                <CardDescription>{announcement.date}</CardDescription>
                            </div>
                            {isPrivileged && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleEditClick(announcement)}>Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteAnnouncement(announcement.id)} className="text-destructive">Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p>{announcement.content}</p>
                    </CardContent>
                </>
            )}
        </Card>
    );
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
              {announcements.filter(a => a.pinned).map(renderAnnouncementCard)}
          </div>
        )}

        {announcements.filter(a => !a.pinned).length > 0 && (
          <div className="space-y-4">
              <h2 className="text-xl font-semibold">All Announcements</h2>
              {announcements.filter(a => !a.pinned).map(renderAnnouncementCard)}
          </div>
        )}
    </div>
  )
}
