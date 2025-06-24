
"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { MoreHorizontal, Upload, FileText, Download, Trash2, Edit, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { db, storage } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { Progress } from "@/components/ui/progress";


type Note = {
  id: string;
  name: string;
  date: Timestamp;
  url: string;
  storagePath: string;
};

export default function NotesPage() {
  const { isPrivileged } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingName, setEditingName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
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


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);

    const storagePath = `notes/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error: ", error);
        toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          await addDoc(collection(db, "notes"), {
            name: file.name,
            date: serverTimestamp(),
            url: downloadURL,
            storagePath: storagePath
          });

          toast({ title: "File Uploaded", description: `${file.name} has been added.` });
          setUploading(false);
        });
      }
    );

    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleDeleteNoteConfirm = async () => {
    if (!noteToDelete) return;
    
    const fileRef = ref(storage, noteToDelete.storagePath);
    try {
      await deleteObject(fileRef);
    } catch (error: any) {
       if (error.code !== 'storage/object-not-found') {
         console.error("Error deleting file from storage: ", error);
         toast({ title: "Storage Error", description: "Could not delete file from storage.", variant: "destructive"});
       }
    }

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
    const finalName = editingName.trim().endsWith('.pdf') ? editingName.trim() : `${editingName.trim()}.pdf`;

    try {
        await updateDoc(docRef, { name: finalName });
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
                  disabled={uploading}
                />
                <Button onClick={() => fileInputRef.current?.click()} className="w-full" disabled={uploading}>
                  {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4" />}
                  {uploading ? `Uploading... ${Math.round(uploadProgress)}%` : "Upload New PDF Note"}
                </Button>
                {uploading && <Progress value={uploadProgress} className="w-full mt-2 h-2" />}
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
                        <p className="text-xs text-muted-foreground">Uploaded: {formatDate(note.date)}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(note.url)}>
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
              This action cannot be undone. This will permanently delete the note titled "{noteToDelete?.name}" from the database and storage.
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
