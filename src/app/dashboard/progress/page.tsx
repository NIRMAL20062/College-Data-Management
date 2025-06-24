
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubjectChart } from "@/components/progress/subject-chart";
import { TimeChart } from "@/components/progress/time-chart";
import { ExamTypeChart } from "@/components/progress/exam-type-chart";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Exam = {
    id: string;
    subject: string;
    date: string;
    obtained: number;
    total: number;
    examType: 'IT 1/2' | 'Mid Sem' | 'End Sem';
};

export default function ProgressPage() {
    const { user } = useAuth();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        
        const q = query(collection(db, `users/${user.uid}/exams`), orderBy("date", "asc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const examsData: Exam[] = [];
            querySnapshot.forEach((doc) => {
                examsData.push({ id: doc.id, ...doc.data() } as Exam);
            });
            setExams(examsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching exams for progress: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const subjectPerformanceData = useMemo(() => {
        const subjectScores: { [key: string]: { totalObtained: number, totalMax: number, count: number } } = {};
        exams.forEach(exam => {
            if (!subjectScores[exam.subject]) {
                subjectScores[exam.subject] = { totalObtained: 0, totalMax: 0, count: 0 };
            }
            subjectScores[exam.subject].totalObtained += exam.obtained;
            subjectScores[exam.subject].totalMax += exam.total;
            subjectScores[exam.subject].count++;
        });

        const colorPalette = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
        return Object.entries(subjectScores).map(([subject, data], index) => ({
            subject,
            score: parseFloat(((data.totalObtained / data.totalMax) * 100).toFixed(1)),
            fill: colorPalette[index % colorPalette.length],
        }));
    }, [exams]);

    const progressOverTimeData = useMemo(() => {
        return exams.map(exam => ({
            date: exam.date,
            score: parseFloat(((exam.obtained / exam.total) * 100).toFixed(1))
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [exams]);

    const examTypePerformanceData = useMemo(() => {
         const typeScores: { [key in Exam['examType']]: { totalObtained: number, totalMax: number, count: number } } = {
            'IT 1/2': { totalObtained: 0, totalMax: 0, count: 0 },
            'Mid Sem': { totalObtained: 0, totalMax: 0, count: 0 },
            'End Sem': { totalObtained: 0, totalMax: 0, count: 0 },
        };
        exams.forEach(exam => {
            if (exam.examType && typeScores[exam.examType]) {
                typeScores[exam.examType].totalObtained += exam.obtained;
                typeScores[exam.examType].totalMax += exam.total;
                typeScores[exam.examType].count++;
            }
        });
        
        return Object.entries(typeScores).map(([type, data]) => ({
            name: type,
            AverageScore: data.count > 0 ? parseFloat(((data.totalObtained / data.totalMax) * 100).toFixed(1)) : 0,
            Exams: data.count,
        }));
    }, [exams]);
    
    if(loading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full"/></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full"/></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-64 w-full"/></CardContent></Card>
                </div>
            </div>
        )
    }

    if(exams.length === 0 && !loading) {
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
            <CardDescription>Your score trend across all recorded exams.</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeChart data={progressOverTimeData} />
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Performance by Subject</CardTitle>
            <CardDescription>Your average score in each subject.</CardDescription>
          </CardHeader>
          <CardContent>
            <SubjectChart data={subjectPerformanceData} />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Performance by Exam Type</CardTitle>
            <CardDescription>A breakdown of your average scores and number of exams for each exam category.</CardDescription>
        </CardHeader>
        <CardContent>
            <ExamTypeChart data={examTypePerformanceData} />
        </CardContent>
      </Card>
    </div>
  )
}

    