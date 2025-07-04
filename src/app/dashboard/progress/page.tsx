
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubjectPerformanceChart } from "@/components/progress/subject-performance-chart";
import { ClassAverageChart } from "@/components/progress/class-average-chart";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, collectionGroup, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

type Exam = {
    id: string;
    userId: string;
    subject: string;
    date: string;
    obtained: number;
    total: number;
    examType: 'IT 1' | 'IT 2' | 'Mid Sem' | 'End Sem';
    semester: number;
};

const examTypes: Exam['examType'][] = ['IT 1', 'IT 2', 'Mid Sem', 'End Sem'];

export default function ProgressPage() {
    const { user, currentSemester } = useAuth();
    const [userExams, setUserExams] = useState<Exam[]>([]);
    const [allExams, setAllExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedExamType, setSelectedExamType] = useState<Exam['examType']>('Mid Sem');

    useEffect(() => {
        if (!user || !currentSemester) {
             setLoading(false);
             return;
        };
        
        setLoading(true);
        const controller = new AbortController();
        const { signal } = controller;

        const userExamsQuery = query(
            collection(db, `users/${user.uid}/exams`),
            where("semester", "==", currentSemester),
            where("examType", "==", selectedExamType)
        );
        const unsubscribeUserExams = onSnapshot(userExamsQuery, (snapshot) => {
            if (signal.aborted) return;
            const examsData = snapshot.docs.map(doc => ({ id: doc.id, userId: user.uid, ...doc.data() } as Exam));
            setUserExams(examsData);
        }, (error) => {
            console.error("Error fetching user exams for progress: ", error);
        });

        // This query for fetching all students' exams can require a manually created index in Firestore.
        // To avoid this, we query all exams across all users and filter on the client.
        // This is not ideal for very large datasets but avoids backend configuration.
        const allExamsQuery = query(
            collectionGroup(db, 'exams')
        );
        const unsubscribeAllExams = onSnapshot(allExamsQuery, (snapshot) => {
            if (signal.aborted) return;
            const examsData: Exam[] = [];
            snapshot.forEach(doc => {
                const path = doc.ref.path.split('/');
                const userId = path[path.indexOf('users') + 1];
                examsData.push({ id: doc.id, userId: userId, ...doc.data() } as Exam);
            });
            
            // Filter by selected semester AND exam type on the client
            const filteredExams = examsData.filter(exam => 
                exam.semester === currentSemester && exam.examType === selectedExamType
            );
            setAllExams(filteredExams);
            setLoading(false); // Set loading to false after the final data processing
        }, (error) => {
            console.error("Error fetching all exams. This might be due to a missing Firestore index. Check the console for a link to create one.", error);
            setLoading(false);
        });

        return () => {
            controller.abort();
            unsubscribeUserExams();
            unsubscribeAllExams();
        };
    }, [user, currentSemester, selectedExamType]);

    if (loading || !currentSemester) {
        return (
             <div className="flex justify-center items-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const hasAnyDataForType = userExams.length > 0 || allExams.length > 0;

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Performance Analysis for Semester {currentSemester}</CardTitle>
                <CardDescription>Select an exam type to see your performance breakdown and comparison against the class average for your current semester.</CardDescription>
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

        {!hasAnyDataForType ? (
            <Card>
                <CardContent className="flex items-center justify-center p-10">
                     <p className="text-muted-foreground">No data available for Semester {currentSemester} - <span className="font-semibold">{selectedExamType}</span>.</p>
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
                        <SubjectPerformanceChart data={userExams} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Class Comparison</CardTitle>
                        <CardDescription>Your average score vs. the class average in the <span className="font-semibold">{selectedExamType}</span> exam.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ClassAverageChart 
                            userExams={userExams}
                            allExams={allExams} 
                            userId={user!.uid}
                        />
                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  )
}
