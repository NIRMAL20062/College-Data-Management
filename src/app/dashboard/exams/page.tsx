
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { semesters } from "@/lib/subjects";
import { Loader2, CheckCircle, Edit, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Define the shape of an exam record
type Exam = {
    id: string;
    semester: number;
    subject: string;
    date: string;
    obtained: number;
    total: number;
    examType: 'IT 1' | 'IT 2' | 'Mid Sem' | 'End Sem';
};

const examTypes: Exam['examType'][] = ['IT 1', 'IT 2', 'Mid Sem', 'End Sem'];

// This will be the form inside the dialog
const ExamEntryForm = ({ 
    semester, 
    examType, 
    existingExams, 
    onSave, 
    onCancel 
}: { 
    semester: number; 
    examType: Exam['examType'];
    existingExams: Exam[];
    onSave: (formData: Record<string, { obtained: string, total: string, date: string }>) => Promise<void>; 
    onCancel: () => void 
}) => {
    const subjects = useMemo(() => {
        return semesters.find(s => s.semester === semester)?.subjects || [];
    }, [semester]);

    const [formData, setFormData] = useState<Record<string, { obtained: string, total: string, date: string }>>(() => {
        const initialData: Record<string, { obtained: string, total: string, date: string }> = {};
        const commonDate = existingExams[0]?.date || new Date().toISOString().split("T")[0];

        subjects.forEach(subject => {
            const existing = existingExams.find(e => e.subject === subject);
            initialData[subject] = {
                obtained: existing?.obtained.toString() || "",
                total: existing?.total.toString() || "100",
                date: existing?.date || commonDate,
            };
        });
        return initialData;
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    
    const handleInputChange = (subject: string, field: 'obtained' | 'total' | 'date', value: string) => {
        setFormData(prev => ({
            ...prev,
            [subject]: {
                ...prev[subject],
                [field]: value
            }
        }));
    };
    
    const handleDateChangeForAll = (newDate: string) => {
        const updatedData = { ...formData };
        for (const subject in updatedData) {
            updatedData[subject].date = newDate;
        }
        setFormData(updatedData);
    };

    const handleSubmit = async () => {
        setLoading(true);
        // Basic validation
        for (const subject of subjects) {
            const entry = formData[subject];
            const obtained = parseFloat(entry.obtained);
            const total = parseFloat(entry.total);
            if (entry.obtained && (isNaN(obtained) || isNaN(total) || total <= 0 || obtained > total)) {
                toast({ title: "Validation Error", description: `Invalid score for ${subject}.`, variant: "destructive" });
                setLoading(false);
                return;
            }
        }

        try {
            await onSave(formData);
        } catch (e) {
            // onSave should handle its own toasts
        } finally {
            setLoading(false);
        }
    };
    
    const commonDate = formData[subjects[0]]?.date || new Date().toISOString().split("T")[0];

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="common-date">Exam Date (for all subjects)</Label>
                <Input 
                    id="common-date" 
                    type="date" 
                    value={commonDate} 
                    onChange={e => handleDateChangeForAll(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {subjects.map(subject => (
                    <div key={subject} className="space-y-2">
                        <Label>{subject}</Label>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                placeholder="Obtained"
                                value={formData[subject]?.obtained || ""}
                                onChange={(e) => handleInputChange(subject, 'obtained', e.target.value)}
                            />
                            <Input 
                                type="number" 
                                placeholder="Total" 
                                value={formData[subject]?.total || ""}
                                onChange={(e) => handleInputChange(subject, 'total', e.target.value)}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Save Scores
                </Button>
            </DialogFooter>
        </div>
    );
};

export default function ExamsPage() {
    const { user, currentSemester } = useAuth();
    const { toast } = useToast();
    
    const [allExams, setAllExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedExamType, setSelectedExamType] = useState<Exam['examType'] | null>(null);

    const subjectsForSemester = useMemo(() => {
        return semesters.find(s => s.semester === currentSemester)?.subjects || [];
    }, [currentSemester]);

    useEffect(() => {
        if (!user || !currentSemester) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const q = query(collection(db, `users/${user.uid}/exams`), where("semester", "==", currentSemester));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const examsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Exam);
            setAllExams(examsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching exams: ", error);
            toast({ title: "Error", description: "Could not fetch exam records.", variant: "destructive" });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, currentSemester, toast]);

    const handleSaveScores = async (formData: Record<string, { obtained: string, total: string, date: string }>) => {
        if (!user || !currentSemester || !selectedExamType) return;
        
        const batch = writeBatch(db);
        let operationsCount = 0;

        for (const subject in formData) {
            const entry = formData[subject];
            const obtained = parseFloat(entry.obtained);
            const total = parseFloat(entry.total);

            // Only process if 'obtained' has a value
            if (entry.obtained && !isNaN(obtained) && !isNaN(total)) {
                const existingExam = allExams.find(e => e.subject === subject && e.examType === selectedExamType);
                
                const examData = {
                    semester: currentSemester,
                    subject,
                    examType: selectedExamType,
                    date: entry.date,
                    obtained: obtained,
                    total: total,
                };
                
                if (existingExam) {
                    // Update existing document
                    const docRef = doc(db, `users/${user.uid}/exams`, existingExam.id);
                    batch.update(docRef, examData);
                    operationsCount++;
                } else {
                    // Create new document
                    const docRef = doc(collection(db, `users/${user.uid}/exams`));
                    batch.set(docRef, { ...examData, createdAt: serverTimestamp() });
                    operationsCount++;
                }
            }
        }

        if (operationsCount === 0) {
            toast({ title: "No changes", description: "No new scores were entered to save." });
            return;
        }

        try {
            await batch.commit();
            toast({ title: "Success", description: `${selectedExamType} scores have been saved.` });
            setIsDialogOpen(false);
            setSelectedExamType(null);
        } catch (error) {
            console.error("Error saving exam scores: ", error);
            toast({ title: "Save Failed", description: "An error occurred while saving scores.", variant: "destructive" });
        }
    };
    
    const openDialogFor = (examType: Exam['examType']) => {
        setSelectedExamType(examType);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedExamType(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!currentSemester) {
         return (
            <Card>
                <CardHeader>
                    <CardTitle>Exam Records</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-10">
                    <p className="text-muted-foreground">Please set your current semester in Settings to view this page.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Exam Records for Semester {currentSemester}</CardTitle>
                    <CardDescription>Select an exam type to enter or update your scores for the subjects in your current semester.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {examTypes.map(examType => {
                    const examsForType = allExams.filter(e => e.examType === examType);
                    const gradedCount = examsForType.length;
                    const totalSubjects = subjectsForSemester.length;
                    const progress = totalSubjects > 0 ? (gradedCount / totalSubjects) * 100 : 0;
                    const isComplete = gradedCount === totalSubjects && totalSubjects > 0;

                    return (
                        <Card 
                            key={examType} 
                            className="flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                            onClick={() => openDialogFor(examType)}
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle>{examType}</CardTitle>
                                    {isComplete ? (
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                    ) : (
                                        <BookOpen className="h-6 w-6 text-muted-foreground"/>
                                    )}
                                </div>
                                <CardDescription>
                                    {isComplete ? "All subjects graded" : `${gradedCount} of ${totalSubjects} subjects graded`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <Progress value={progress} aria-label={`${progress}% graded`}/>
                            </CardContent>
                             <CardFooter>
                                <Button variant="secondary" className="w-full">
                                    <Edit className="mr-2 h-4 w-4"/>
                                    {gradedCount > 0 ? 'Edit Scores' : 'Enter Scores'}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Enter Scores for {selectedExamType}</DialogTitle>
                        <DialogDescription>
                            Fill in your scores for each subject in Semester {currentSemester}. Any existing scores will be updated.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedExamType && (
                         <ExamEntryForm 
                            semester={currentSemester}
                            examType={selectedExamType}
                            existingExams={allExams.filter(e => e.examType === selectedExamType)}
                            onSave={handleSaveScores}
                            onCancel={closeDialog}
                         />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
