
// src/app/dashboard/notes/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";

const initialNotes = [
    { id: 1, title: "Quantum Mechanics Lecture", date: "2024-05-21", content: "Key takeaways: Wave-particle duality is weird. Schrödinger's cat is a thought experiment, not a real one..." },
    { id: 2, title: "Project Brainstorm", date: "2024-05-20", content: "Ideas for the history project: The Silk Road's impact on cultural exchange. The fall of the Roman Empire. The invention of the printing press." },
];

export default function NotesPage() {
  const { isPrivileged } = useAuth();
  const [notes, setNotes] = useState(initialNotes);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  const handleSaveNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote = {
      id: notes.length + 1,
      title: newNoteTitle,
      content: newNoteContent,
      date: new Date().toISOString().split('T')[0],
    };
    setNotes([newNote, ...notes]);
    setNewNoteTitle("");
    setNewNoteContent("");
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
        {notes.map(note => (
            <Card key={note.id}>
                <CardHeader className="p-4">
                    <CardTitle className="text-base">{note.title}</CardTitle>
                    <CardDescription>{note.date}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground truncate">{note.content}</p>
                </CardContent>
            </Card>
        ))}
        {notes.length > 0 && (
             <Button variant="outline" className="w-full">Download All Notes</Button>
        )}
      </div>
    </div>
  )
}
