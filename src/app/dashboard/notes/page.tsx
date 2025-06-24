
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Upload, FileText, Download, Trash2, Edit } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// In a real app, this would be a more complex object with URLs etc.
type Note = {
  id: number;
  name: string;
  date: string;
};

export default function NotesPage() {
  const { isPrivileged } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingName, setEditingName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      const newNote: Note = {
        id: Date.now(),
        name: file.name,
        date: new Date().toISOString().split('T')[0],
      };
      setNotes(prevNotes => [newNote, ...prevNotes]);
      toast({
        title: "File Uploaded",
        description: `${file.name} has been added to notes.`,
      });
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
    setNoteToDelete(null);
    toast({
        title: "Note Deleted",
        description: "The note has been successfully removed.",
    });
  };

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setEditingName(note.name);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditingName("");
  };

  const handleSaveEdit = () => {
    if (!editingNote || !editingName.trim()) return;
    
    setNotes(notes.map(note => 
      note.id === editingNote.id ? { ...note, name: editingName.trim().endsWith('.pdf') ? editingName.trim() : `${editingName.trim()}.pdf` } : note
    ));
    handleCancelEdit();
    toast({
        title: "Note Renamed",
        description: "The note has been successfully renamed.",
    });
  };

  const handleDownload = (noteName: string) => {
    toast({
        title: "Download Started",
        description: `Downloading ${noteName}... (This is a placeholder)`,
    });
    // In a real app, you would trigger a file download here.
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_350px]">
      <div>
        <Card>
            <CardHeader>
                <CardTitle>Course Notes</CardTitle>
                <CardDescription>
                  {isPrivileged 
                    ? "Upload and manage PDF notes for all students."
                    : "Here you can find and download all available course notes."}
                </CardDescription>
            </CardHeader>
            {isPrivileged && (
              <CardContent>
                <input
                  type="file"
                  accept=".pdf"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New PDF Note
                </Button>
              </CardContent>
            )}
        </Card>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Notes</h2>
        {notes.length > 0 ? (
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
                        <p className="text-xs text-muted-foreground">Uploaded: {note.date}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(note.name)}>
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
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
                <p className="text-muted-foreground">No notes have been uploaded yet.</p>
            </Card>
        )}
      </div>

       <AlertDialog open={!!noteToDelete} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the note titled "{noteToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => noteToDelete && handleDeleteNote(noteToDelete.id)} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
