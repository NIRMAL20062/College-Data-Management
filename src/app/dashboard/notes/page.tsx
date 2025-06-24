
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, FileText, Download, Trash2, Edit, Loader2, PlusCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";


type Note = {
  id: string;
  name: string;
  date: Timestamp;
  url: string;
};

export default function NotesPage() {
  const { isPrivileged } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newNoteName, setNewNoteName] = useState("");
  const [newNoteUrl, setNewNoteUrl] = useState("");

  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingName, setEditingName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "notes"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notesData: Note[] = [];
      querySnapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() } as Note);
      });
      setNotes(notesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notes: ", error);
      toast({ title: "Error", description: "Could not fetch notes.", variant: "destructive" });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  const handleAddNote = async () => {
    if (!newNoteName.trim() || !newNoteUrl.trim()) {
        toast({ title: "Missing Fields", description: "Please provide both a name and a link.", variant: "destructive" });
        return;
    }
    try {
        new URL(newNoteUrl);
    } catch (_) {
        toast({ title: "Invalid URL", description: "Please enter a valid link.", variant: "destructive" });
        return;
    }

    try {
      await addDoc(collection(db, "notes"), {
        name: newNoteName,
        date: serverTimestamp(),
        url: newNoteUrl,
      });

      toast({ title: "Note Added", description: `${newNoteName} has been added.` });
      setNewNoteName("");
      setNewNoteUrl("");
    } catch (error) {
      console.error("Error adding note: ", error);
      toast({ title: "Error", description: "Failed to add note.", variant: "destructive" });
    }
  };

  const handleDeleteNoteConfirm = async () => {
    if (!noteToDelete) return;

    try {
      await deleteDoc(doc(db, "notes", noteToDelete.id));
      toast({ title: "Note Deleted", description: "The note has been successfully removed." });
    } catch (error) {
       console.error("Error deleting note from firestore: ", error);
       toast({ title: "Database Error", description: "Could not delete note record.", variant: "destructive"});
    }
    
    setNoteToDelete(null);
  };

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setEditingName(note.name);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditingName("");
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editingName.trim()) return;
    
    const docRef = doc(db, "notes", editingNote.id);

    try {
        await updateDoc(docRef, { name: editingName.trim() });
        toast({ title: "Note Renamed", description: "The note has been successfully renamed." });
    } catch (error) {
        console.error("Error renaming note: ", error);
        toast({ title: "Error", description: "Failed to rename note.", variant: "destructive"});
    }
    handleCancelEdit();
  };

  const handleDownload = (noteUrl: string) => {
    window.open(noteUrl, '_blank');
  };
  
  const formatDate = (timestamp: Timestamp) => {
    return timestamp ? timestamp.toDate().toISOString().split('T')[0] : "N/A";
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <Card>
            <CardHeader>
                <CardTitle>Course Notes</CardTitle>
                <CardDescription>
                  {isPrivileged 
                    ? "Add and manage links to notes for all students."
                    : "Here you can find and open all available course notes."}
                </CardDescription>
            </CardHeader>
            {isPrivileged && (
              <CardContent>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Add New Note</h3>
                  <div className="space-y-2">
                    <Label htmlFor="note-name">Note Name</Label>
                    <Input
                      id="note-name"
                      placeholder="e.g., Chapter 5 Notes"
                      value={newNoteName}
                      onChange={(e) => setNewNoteName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note-url">Google Drive Link</Label>
                    <Input
                      id="note-url"
                      placeholder="Paste shareable link here"
                      value={newNoteUrl}
                      onChange={(e) => setNewNoteUrl(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddNote} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Note Link
                  </Button>
                </div>
              </CardContent>
            )}
        </Card>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Notes</h2>
        {loading ? (
             <div className="flex justify-center items-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : notes.length > 0 ? (
          notes.map(note => (
            <Card key={note.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileText className="h-6 w-6 shrink-0 text-primary"/>
                  {editingNote?.id === note.id ? (
                     <Input 
                        value={editingName} 
                        onChange={(e) => setEditingName(e.target.value)} 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                        onBlur={handleCancelEdit}
                        className="h-8"
                     />
                  ) : (
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-medium truncate" title={note.name}>{note.name}</p>
                        <p className="text-xs text-muted-foreground">Added: {formatDate(note.date)}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(note.url)}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Open Link</span>
                    </Button>
                    {isPrivileged && (
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Toggle menu</span>
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditClick(note)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setNoteToDelete(note)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
            <Card className="flex items-center justify-center p-10">
                <p className="text-muted-foreground">No notes have been added yet.</p>
            </Card>
        )}
      </div>

       <AlertDialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note titled "{noteToDelete?.name}" from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNoteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

    