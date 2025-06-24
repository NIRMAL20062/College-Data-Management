
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal, Trash2, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Exam = {
    id: number;
    name: string;
    subject: string;
    date: string;
    obtained: number;
    total: number;
};

const ExamForm = ({ exam, onSave, onCancel }: { exam: Partial<Exam> | null; onSave: (exam: Omit<Exam, 'id'>) => void; onCancel: () => void }) => {
    const [name, setName] = useState(exam?.name || "");
    const [subject, setSubject] = useState(exam?.subject || "");
    const [date, setDate] = useState(exam?.date || new Date().toISOString().split("T")[0]);
    const [obtained, setObtained] = useState(exam?.obtained || 0);
    const [total, setTotal] = useState(exam?.total || 100);
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!name || !subject || !date || total <= 0) {
            toast({ title: "Validation Error", description: "Please fill all fields correctly.", variant: "destructive" });
            return;
        }
        if (obtained > total) {
            toast({ title: "Validation Error", description: "Obtained score cannot be greater than total score.", variant: "destructive" });
            return;
        }

        onSave({ name, subject, date, obtained, total });
    };

    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subject" className="text-right">Subject</Label>
                <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="obtained" className="text-right">Score</Label>
                <div className="col-span-3 grid grid-cols-2 gap-2">
                    <Input id="obtained" type="number" placeholder="Obtained" value={obtained} onChange={e => setObtained(Number(e.target.value))} />
                    <Input id="total" type="number" placeholder="Total" value={total} onChange={e => setTotal(Number(e.target.value))} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Cancel</Button>
                <Button onClick={handleSubmit}>Save</Button>
            </DialogFooter>
        </div>
    );
}

const getGradeColor = (percentage: number) => {
  if (percentage >= 90) return "bg-green-500/20 text-green-700 border-green-400";
  if (percentage >= 80) return "bg-blue-500/20 text-blue-700 border-blue-400";
  if (percentage >= 70) return "bg-yellow-500/20 text-yellow-700 border-yellow-400";
  return "bg-red-500/20 text-red-700 border-red-400";
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const { toast } = useToast();

  const handleSaveExam = (examData: Omit<Exam, 'id'>) => {
    if (editingExam) {
        // Update existing exam
        setExams(exams.map(e => e.id === editingExam.id ? { ...editingExam, ...examData } : e));
        toast({ title: "Success", description: "Exam record updated." });
    } else {
        // Add new exam
        const newExam: Exam = { id: Date.now(), ...examData };
        setExams([newExam, ...exams]);
        toast({ title: "Success", description: "New exam record added." });
    }
    closeDialog();
  };

  const handleDeleteExam = () => {
    if (!examToDelete) return;
    setExams(exams.filter(e => e.id !== examToDelete.id));
    setExamToDelete(null);
    toast({ title: "Success", description: "Exam record deleted." });
  };
  
  const openEditDialog = (exam: Exam) => {
    setEditingExam(exam);
    setIsDialogOpen(true);
  };
  
  const openAddDialog = () => {
    setEditingExam(null);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingExam(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exam Records</CardTitle>
              <CardDescription>Manage your past exam results.</CardDescription>
            </div>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Exam
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length > 0 ? exams.map((exam) => {
                const percentage = Math.round((exam.obtained / exam.total) * 100);
                return (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell>{exam.subject}</TableCell>
                    <TableCell>{exam.date}</TableCell>
                    <TableCell>{exam.obtained} / {exam.total}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getGradeColor(percentage)}>{percentage}%</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(exam)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => setExamToDelete(exam)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              }) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No exam records found. Click "Add Exam" to get started.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader>
                <DialogTitle>{editingExam ? 'Edit Exam Record' : 'Add New Exam Record'}</DialogTitle>
                <DialogDescription>
                    {editingExam ? 'Update the details for this exam.' : 'Fill in the details for the new exam.'}
                </DialogDescription>
            </DialogHeader>
            <ExamForm exam={editingExam} onSave={handleSaveExam} onCancel={closeDialog} />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!examToDelete} onOpenChange={(open) => !open && setExamToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the record for "{examToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setExamToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteExam} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
