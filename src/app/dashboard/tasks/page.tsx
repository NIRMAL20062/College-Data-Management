
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";

type Task = {
  id: string;
  text: string;
  subject: string;
  done: boolean;
  createdAt: Timestamp;
};

export default function TasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const q = query(collection(db, `users/${user.uid}/tasks`), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks: ", error);
      toast({ title: "Error", description: "Could not fetch tasks.", variant: "destructive" });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !newTaskSubject.trim() || !user) {
      toast({ title: "Missing Fields", description: "Please provide both a task and a subject.", variant: "destructive" });
      return;
    }

    try {
      await addDoc(collection(db, `users/${user.uid}/tasks`), {
        text: newTaskText,
        subject: newTaskSubject,
        done: false,
        createdAt: serverTimestamp(),
      });
      setNewTaskText("");
      setNewTaskSubject("");
      toast({ title: "Task Added", description: "Your new task is on the list." });
    } catch (error) {
      console.error("Error adding task:", error);
      toast({ title: "Error", description: "Failed to add task.", variant: "destructive"});
    }
  };

  const handleToggleTask = async (task: Task) => {
    if (!user) return;
    const taskRef = doc(db, `users/${user.uid}/tasks`, task.id);
    try {
      await updateDoc(taskRef, { done: !task.done });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({ title: "Error", description: "Failed to update task status.", variant: "destructive"});
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    const taskRef = doc(db, `users/${user.uid}/tasks`, taskId);
    try {
      await deleteDoc(taskRef);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({ title: "Error", description: "Failed to delete task.", variant: "destructive"});
    }
  };

  const tasksBySubject = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const { subject } = task;
      if (!acc[subject]) {
        acc[subject] = [];
      }
      acc[subject].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Manager</CardTitle>
          <CardDescription>Keep track of your assignments and to-dos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTask} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="newTaskText">New Task</Label>
              <Input
                id="newTaskText"
                placeholder="e.g., Read Chapter 5"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
              />
            </div>
            <div className="w-1/3 space-y-2">
              <Label htmlFor="newTaskSubject">Subject</Label>
              <Input
                id="newTaskSubject"
                placeholder="e.g., Science"
                value={newTaskSubject}
                onChange={(e) => setNewTaskSubject(e.target.value)}
              />
            </div>
            <Button type="submit">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tasks.length === 0 ? (
         <Card className="flex items-center justify-center p-10">
            <p className="text-muted-foreground">No tasks yet. Add one to get started!</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(tasksBySubject).map(([subject, subjectTasks]) => (
            <Card key={subject}>
              <CardHeader>
                <CardTitle>{subject}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjectTasks.map(task => (
                  <div key={task.id} className="flex items-center group">
                    <Checkbox
                      id={task.id}
                      checked={task.done}
                      onCheckedChange={() => handleToggleTask(task)}
                      className="mr-3"
                    />
                    <Label htmlFor={task.id} className={`flex-1 ${task.done ? 'line-through text-muted-foreground' : ''}`}>
                      {task.text}
                    </Label>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
