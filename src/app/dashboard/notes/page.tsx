import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const notes = [
    { id: 1, title: "Quantum Mechanics Lecture", date: "2024-05-21", content: "Key takeaways: Wave-particle duality is weird. Schrödinger's cat is a thought experiment, not a real one..." },
    { id: 2, title: "Project Brainstorm", date: "2024-05-20", content: "Ideas for the history project: The Silk Road's impact on cultural exchange. The fall of the Roman Empire. The invention of the printing press." },
];

export default function NotesPage() {
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>New Note</CardTitle>
                <CardDescription>Jot down your thoughts, ideas, or lecture notes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea placeholder="Title" className="text-lg font-semibold"/>
                <Textarea placeholder="Start writing..." rows={15} />
                <Button>Save Note</Button>
            </CardContent>
        </Card>
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
      </div>
    </div>
  )
}
