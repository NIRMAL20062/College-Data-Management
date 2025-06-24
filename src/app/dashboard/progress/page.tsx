
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubjectPerformanceChart } from "@/components/progress/subject-performance-chart";
import { ClassAverageChart } from "@/components/progress/class-average-chart";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, collectionGroup, where } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Exam = {
    id: string;
    userId: string;
    subject: string;
    date: string;
    obtained: number;
    total: number;
    examType: 'IT 1' | 'IT 2' | 'Mid Sem' | 'End Sem';
};

const examTypes: Exam['examType'][] = ['IT 1', 'IT 2', 'Mid Sem', 'End Sem'];

export default function ProgressPage() {
    const { user } = useAuth();
    const [userExams, setUserExams] = useState<Exam[]>([]);
    const [allExams, setAllExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedExamType, setSelectedExamType] = useState<Exam['examType']>('Mid Sem');

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const userExamsQuery = query(collection(db, `users/${user.uid}/exams`));
        const unsubscribeUserExams = onSnapshot(userExamsQuery, (snapshot) => {
            const examsData = snapshot.docs.map(doc => ({ id: doc.id, userId: user.uid, ...doc.data() } as Exam));
            setUserExams(examsData);
        }, (error) => {
            console.error("Error fetching user exams for progress: ", error);
        });

        // Use a collection group query to fetch all exams for class stats
        const allExamsQuery = query(collectionGroup(db, 'exams'));
        const unsubscribeAllExams = onSnapshot(allExamsQuery, (snapshot) => {
            const examsData: Exam[] = [];
             snapshot.forEach(doc => {
                // We need to get the userId from the document path
                const path = doc.ref.path.split('/');
                const userId = path[path.indexOf('users') + 1];
                examsData.push({ id: doc.id, userId: userId, ...doc.data() } as Exam);
            });
            setAllExams(examsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching all exams for progress: ", error);
            setLoading(false);
        });

        return () => {
            unsubscribeUserExams();
            unsubscribeAllExams();
        };
    }, [user]);

    const filteredUserExams = useMemo(() => {
        return userExams.filter(exam => exam.examType === selectedExamType);
    }, [userExams, selectedExamType]);

    const filteredAllExams = useMemo(() => {
        return allExams.filter(exam => exam.examType === selectedExamType);
    }, [allExams, selectedExamType]);


    if (loading) {
        return (
            <div className="space-y-6">
                <Card><CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader><CardContent><Skeleton className="h-10 w-1/3" /></CardContent></Card>
                <div className="grid gap-6 md:grid-cols-2">
                    <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-80 w-full"/></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-80 w-full"/></CardContent></Card>
                </div>
            </div>
        )
    }

    if (userExams.length === 0 && !loading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Your Progress</CardTitle>
                    <CardDescription>Graphs of your performance will appear here once you add exam records.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-20">
                     <p className="text-muted-foreground">No exam data available to show progress.</p>
                </CardContent>
            </Card>
        )
    }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Performance Analysis</CardTitle>
                <CardDescription>Select an exam type to see your detailed performance breakdown and comparison against the class average.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full md:w-1/3">
                    <Select value={selectedExamType} onValueChange={(value: Exam['examType']) => setSelectedExamType(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an exam type" />
                        </SelectTrigger>
                        <SelectContent>
                            {examTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>

        {filteredUserExams.length === 0 ? (
            <Card>
                <CardContent className="flex items-center justify-center p-10">
                     <p className="text-muted-foreground">You have no data for the selected exam type: <span className="font-semibold">{selectedExamType}</span>.</p>
                </CardContent>
            </Card>
        ) : (
             <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Subject Performance</CardTitle>
                        <CardDescription>Your scores for each subject in the <span className="font-semibold">{selectedExamType}</span> exam.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SubjectPerformanceChart data={filteredUserExams} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Class Comparison</CardTitle>
                        <CardDescription>Your average score vs. the class average in the <span className="font-semibold">{selectedExamType}</span> exam.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ClassAverageChart 
                            userExams={filteredUserExams}
                            allExams={filteredAllExams} 
                            userId={user!.uid}
                        />
                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  )
}
