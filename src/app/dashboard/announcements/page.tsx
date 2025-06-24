
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Pin, PlusCircle, Trash2, Edit, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";

type Announcement = {
    id: string;
    pinned: boolean;
    title: string;
    date: Timestamp;
    content: string;
};

export default function AnnouncementsPage() {
  const { isPrivileged } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const announcementsData: Announcement[] = [];
      querySnapshot.forEach((doc) => {
        announcementsData.push({ id: doc.id, ...doc.data() } as Announcement);
      });
      announcementsData.sort((a, b) => (b.pinned ? 1 : -1) - (a.pinned ? 1 : -1) || (b.date?.toMillis() ?? 0) - (a.date?.toMillis() ?? 0));
      setAnnouncements(announcementsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching announcements: ", error);
      toast({ title: "Error", description: "Could not fetch announcements.", variant: "destructive" });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleAddAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
        toast({ title: "Missing Fields", description: "Please fill out both title and content.", variant: "destructive" });
        return;
    }
    try {
      await addDoc(collection(db, "announcements"), {
        pinned: false,
        title: newTitle,
        content: newContent,
        date: serverTimestamp(),
      });
      setNewTitle("");
      setNewContent("");
      toast({ title: "Success", description: "Announcement posted successfully." });
    } catch (error) {
      console.error("Error adding announcement: ", error);
      toast({ title: "Error", description: "Failed to post announcement.", variant: "destructive" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!announcementToDelete) return;
    try {
      await deleteDoc(doc(db, "announcements", announcementToDelete.id));
      setAnnouncementToDelete(null);
      toast({ title: "Success", description: "Announcement deleted." });
    } catch (error) {
      console.error("Error deleting announcement: ", error);
      toast({ title: "Error", description: "Failed to delete announcement.", variant: "destructive" });
    }
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

  const handleSaveEdit = async (id: string) => {
    if (!editingTitle.trim() || !editingContent.trim()) {
      toast({ title: "Missing Fields", description: "Title and content cannot be empty.", variant: "destructive" });
      return;
    }
    try {
      const docRef = doc(db, "announcements", id);
      await updateDoc(docRef, {
        title: editingTitle,
        content: editingContent,
      });
      handleCancelEdit();
      toast({ title: "Success", description: "Announcement updated." });
    } catch (error) {
      console.error("Error updating announcement: ", error);
      toast({ title: "Error", description: "Failed to update announcement.", variant: "destructive" });
    }
  };
  
  const togglePin = async (id: string, currentPinStatus: boolean) => {
    try {
        const docRef = doc(db, "announcements", id);
        await updateDoc(docRef, { pinned: !currentPinStatus });
        toast({ title: "Success", description: "Pin status updated." });
    } catch (error) {
        console.error("Error updating pin status: ", error);
        toast({ title: "Error", description: "Failed to update pin status.", variant: "destructive" });
    }
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return "Just now";
    return timestamp.toDate().toISOString().split('T')[0];
  }

  const renderAnnouncementCard = (announcement: Announcement) => {
    const isEditing = editingId === announcement.id;

    return (
        <Card key={announcement.id} className={announcement.pinned ? "border-l-4 border-primary" : ""}>
            {isEditing ? (
                <>
                    <CardHeader>
                        <Input value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} className="text-lg font-semibold"/>
                        <CardDescription>{formatDate(announcement.date)}</CardDescription>
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
                            <div className="pr-4">
                                <CardTitle>{announcement.title}</CardTitle>
                                <CardDescription>{formatDate(announcement.date)}</CardDescription>
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
                                        <DropdownMenuItem onClick={() => togglePin(announcement.id, announcement.pinned)}>
                                            <Pin className="mr-2 h-4 w-4" />
                                            {announcement.pinned ? "Unpin" : "Pin"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleEditClick(announcement)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setAnnouncementToDelete(announcement)} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap">{announcement.content}</p>
                    </CardContent>
                </>
            )}
        </Card>
    );
  };

  const pinnedAnnouncements = announcements.filter(a => a.pinned);
  const otherAnnouncements = announcements.filter(a => !a.pinned);

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

        {loading ? (
            <div className="flex justify-center items-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
            <>
                {pinnedAnnouncements.length > 0 && (
                  <div className="space-y-4">
                      <h2 className="text-xl font-semibold flex items-center gap-2"><Pin className="text-primary"/> Pinned</h2>
                      {pinnedAnnouncements.map(renderAnnouncementCard)}
                  </div>
                )}

                {otherAnnouncements.length > 0 && (
                  <div className="space-y-4">
                      <h2 className="text-xl font-semibold">{pinnedAnnouncements.length > 0 ? "Other Announcements" : "All Announcements"}</h2>
                      {otherAnnouncements.map(renderAnnouncementCard)}
                  </div>
                )}

                {announcements.length === 0 && (
                    <Card className="flex items-center justify-center p-10">
                        <p className="text-muted-foreground">No announcements have been posted yet.</p>
                    </Card>
                )}
            </>
        )}

        <AlertDialog open={!!announcementToDelete} onOpenChange={(open) => !open && setAnnouncementToDelete(null)}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the announcement titled "{announcementToDelete?.title}".
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setAnnouncementToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                Delete
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  )
}
