
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { semesters } from "@/lib/subjects";
import { attendanceSheetLinks } from "@/lib/attendance-sheets";
import { Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";


type AttendanceRecord = {
  date: string;
  status: 'Present' | 'Absent';
};

type AttendanceData = {
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  recentRecords: AttendanceRecord[];
};

type SubjectAttendanceState = {
  data: AttendanceData | null;
  loading: boolean;
  error: string | null;
};


export default function AttendancePage() {
    const { user, currentSemester, rollNumber } = useAuth();
    const [subjectsData, setSubjectsData] = useState<Record<string, SubjectAttendanceState>>({});
    const [selectedSubjectDetails, setSelectedSubjectDetails] = useState<{ subjectName: string; data: AttendanceData } | null>(null);

    const subjectsForSemester = useMemo(() => {
        if (!currentSemester) return [];
        return semesters.find(s => s.semester === currentSemester)?.subjects || [];
    }, [currentSemester]);

    useEffect(() => {
        if (subjectsForSemester.length === 0 || !user) return;
        
        const fetchAttendanceForSubject = async (subject: string) => {
            setSubjectsData(prev => ({
                ...prev,
                [subject]: { data: null, loading: true, error: null }
            }));

            if (!rollNumber) {
                setSubjectsData(prev => ({ ...prev, [subject]: { data: null, loading: false, error: "Please set your Roll Number in Settings." }}));
                return;
            }

            const sheetUrl = attendanceSheetLinks[subject];
            if (!sheetUrl || sheetUrl.includes('YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE')) {
                 setSubjectsData(prev => ({ ...prev, [subject]: { data: null, loading: false, error: `URL not configured for this subject.` }}));
                return;
            }

            try {
                const response = await fetch(sheetUrl);
                if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                
                const csvText = await response.text();
                const rows = csvText.trim().split(/\r?\n/);
                
                if (rows.length < 4) {
                    throw new Error("Invalid sheet format.");
                }

                const dateHeaderRow = rows[1].split(',').map(h => h.trim());
                const dates = dateHeaderRow.slice(6).filter(Boolean);
                
                let userRowCols: string[] | undefined;
                for (let i = 3; i < rows.length; i++) {
                    const cols = rows[i].split(',');
                    const sheetRollNumber = cols[0]?.trim();
                    if (sheetRollNumber === rollNumber) {
                        userRowCols = cols.map(c => c.trim());
                        break;
                    }
                }

                if (!userRowCols) {
                    throw new Error(`Your roll number "${rollNumber}" was not found.`);
                }
                
                const statuses = userRowCols.slice(6);
                const records: AttendanceRecord[] = [];
                for (let i = 0; i < dates.length; i++) {
                    const status = statuses[i];
                    if (status === 'P' || status === 'Present') {
                        records.push({ date: dates[i], status: 'Present' });
                    } else if (status === 'A' || status === 'Absent') {
                         records.push({ date: dates[i], status: 'Absent' });
                    }
                }

                const attendedClasses = records.filter(r => r.status === 'Present').length;
                const totalClasses = records.length;
                const percentage = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

                const attendanceResult: AttendanceData = {
                    totalClasses,
                    attendedClasses,
                    percentage,
                    recentRecords: records.slice(-10).reverse(),
                };
                 setSubjectsData(prev => ({ ...prev, [subject]: { data: attendanceResult, loading: false, error: null }}));

            } catch (err: any) {
                console.error(`Error for ${subject}:`, err);
                setSubjectsData(prev => ({ ...prev, [subject]: { data: null, loading: false, error: err.message || "Could not load data." }}));
            }
        };
        
        subjectsForSemester.forEach(subject => {
            if (!subjectsData[subject]) {
                fetchAttendanceForSubject(subject);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(subjectsForSemester), user, rollNumber]);

    const renderSubjectCard = (subject: string) => {
        const subjectState = subjectsData[subject];

        if (!subjectState || subjectState.loading) {
            return (
                <Card>
                    <CardHeader><CardTitle>{subject}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                </Card>
            )
        }
        
        if (subjectState.error) {
             return (
                <Card className="border-destructive">
                    <CardHeader><CardTitle>{subject}</CardTitle></CardHeader>
                    <CardContent className="flex flex-col text-center items-center justify-center p-4">
                        <AlertCircle className="h-8 w-8 text-destructive mb-2"/>
                        <p className="text-sm text-destructive">{subjectState.error}</p>
                    </CardContent>
                </Card>
            )
        }

        if (subjectState.data) {
            const { attendedClasses, totalClasses, percentage } = subjectState.data;
            const canViewDetails = subjectState.data.recentRecords.length > 0;
            return (
                 <Card 
                    className={`flex flex-col h-full hover:shadow-lg transition-shadow duration-300 ${canViewDetails ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`} 
                    onClick={() => canViewDetails && setSelectedSubjectDetails({ subjectName: subject, data: subjectState.data! })}
                 >
                    <CardHeader>
                        <CardTitle>{subject}</CardTitle>
                        <CardDescription>
                            Attended: <span className="font-bold text-foreground">{attendedClasses}</span> / {totalClasses}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 flex-grow">
                        <Progress value={percentage} />
                        <p className="text-right font-bold text-lg text-primary">{percentage.toFixed(1)}%</p>
                    </CardContent>
                    {canViewDetails && 
                        <CardFooter>
                            <Button variant="secondary" className="w-full">View Details</Button>
                        </CardFooter>
                    }
                </Card>
            )
        }
        
        return null;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Tracker</CardTitle>
                    <CardDescription>
                        {currentSemester 
                            ? `Your attendance overview for Semester ${currentSemester}. Click a subject to see details.`
                            : "Please set your current semester in Settings to view your attendance."}
                    </CardDescription>
                </CardHeader>
            </Card>

            {currentSemester && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjectsForSemester.map(subject => (
                        <div key={subject}>
                            {renderSubjectCard(subject)}
                        </div>
                    ))}
                </div>
            )}
            
            <Dialog open={!!selectedSubjectDetails} onOpenChange={() => setSelectedSubjectDetails(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedSubjectDetails?.subjectName}</DialogTitle>
                        <DialogDescription>
                            Showing the most recent attendance records for this subject.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="border rounded-md max-h-96 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedSubjectDetails?.data.recentRecords.length ? (
                                    selectedSubjectDetails.data.recentRecords.map((record, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{record.date}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={record.status === 'Present' ? 'default' : 'destructive'}>
                                                    {record.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                     <TableRow>
                                        <TableCell colSpan={2} className="text-center text-muted-foreground">No recent records found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
