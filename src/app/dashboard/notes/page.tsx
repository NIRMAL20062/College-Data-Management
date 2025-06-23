
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const initialNotes = [
    { id: 1, title: "Quantum Mechanics Lecture", date: "2024-05-21", content: "Key takeaways: Wave-particle duality is weird. Schrödinger's cat is a thought experiment, not a real one..." },
    { id: 2, title: "Project Brainstorm", date: "2024-05-20", content: "Ideas for the history project: The Silk Road's impact on cultural exchange. The fall of the Roman Empire. The invention of the printing press." },
];

type Note = typeof initialNotes[0];

export default function NotesPage() {
  const { isPrivileged } = useAuth();
  const [notes, setNotes] = useState(initialNotes);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteTitle, setEditingNoteTitle] = useState("");
  const [editingNoteContent, setEditingNoteContent] = useState("");

  const handleSaveNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote = {
      id: Date.now(),
      title: newNoteTitle,
      content: newNoteContent,
      date: new Date().toISOString().split('T')[0],
    };
    setNotes([newNote, ...notes]);
    setNewNoteTitle("");
    setNewNoteContent("");
  };

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const handleEditClick = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteTitle(note.title);
    setEditingNoteContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteTitle("");
    setEditingNoteContent("");
  };

  const handleSaveEdit = (id: number) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, title: editingNoteTitle, content: editingNoteContent } : note
    ));
    handleCancelEdit();
  };
  
  const renderNoteCard = (note: Note) => {
    const isEditing = editingNoteId === note.id;

    if (isEditing) {
      return (
        <Card key={note.id}>
          <CardHeader className="p-4">
            <Input value={editingNoteTitle} onChange={(e) => setEditingNoteTitle(e.target.value)} className="text-lg font-semibold" />
            <CardDescription>{note.date}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <Textarea value={editingNoteContent} onChange={(e) => setEditingNoteContent(e.target.value)} rows={5} />
          </CardContent>
          <CardFooter className="p-4 pt-0 justify-end gap-2">
            <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
            <Button onClick={() => handleSaveEdit(note.id)}>Save</Button>
          </CardFooter>
        </Card>
      );
    }
    
    return (
      <Card key={note.id}>
          <CardHeader className="p-4 flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">{note.title}</CardTitle>
                <CardDescription>{note.date}</CardDescription>
              </div>
              {isPrivileged && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" className="h-6 w-6">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditClick(note)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteNote(note.id)} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              )}
          </CardHeader>
          <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground truncate">{note.content}</p>
          </CardContent>
      </Card>
    );
  };


  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        {isPrivileged && (
            <Card>
                <CardHeader>
                    <CardTitle>New Note</CardTitle>
                    <CardDescription>Jot down your thoughts, ideas, or lecture notes for others to see.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input 
                      placeholder="Title" 
                      className="text-lg font-semibold"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                    />
                    <Textarea 
                      placeholder="Start writing..." 
                      rows={15}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                    />
                    <Button onClick={handleSaveNote}>Save Note</Button>
                </CardContent>
            </Card>
        )}
        {!isPrivileged && (
             <Card>
                <CardHeader>
                    <CardTitle>Notes</CardTitle>
                    <CardDescription>Here you can find notes uploaded by contributors. To upload, you need privileged access.</CardDescription>
                </CardHeader>
             </Card>
        )}
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Notes</h2>
        {notes.map(renderNoteCard)}
        {notes.length > 0 && (
             <Button variant="outline" className="w-full">Download All Notes</Button>
        )}
      </div>
    </div>
  )
}
