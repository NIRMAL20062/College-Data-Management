
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { semesters } from "@/lib/subjects";
import { attendanceSheetLinks } from "@/lib/attendance-sheets";
import { Loader2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

export default function AttendancePage() {
    const { user, currentSemester, rollNumber } = useAuth();
    const { toast } = useToast();
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);

    const subjectsForSemester = useMemo(() => {
        if (!currentSemester) return [];
        return semesters.find(s => s.semester === currentSemester)?.subjects || [];
    }, [currentSemester]);

    useEffect(() => {
        if (subjectsForSemester.length > 0 && !selectedSubject) {
            setSelectedSubject(subjectsForSemester[0]);
        }
    }, [subjectsForSemester, selectedSubject]);

    useEffect(() => {
        if (!selectedSubject || !user) return;
        
        const fetchAttendance = async () => {
            setLoading(true);
            setError(null);
            setAttendanceData(null);

            if (!rollNumber) {
                setError("Please set your Roll Number in the Settings page to view attendance.");
                setLoading(false);
                return;
            }

            const sheetUrl = attendanceSheetLinks[selectedSubject];
            if (!sheetUrl || sheetUrl.includes('YOUR_PUBLISHED_GOOGLE_SHEET_CSV_URL_HERE')) {
                setError(`Attendance sheet URL for "${selectedSubject}" is not configured. Please update it in the 'src/lib/attendance-sheets.ts' file.`);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(sheetUrl);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch data. Status: ${response.status}`);
                }

                const csvText = await response.text();
                const rows = csvText.trim().split(/\r?\n/);
                
                if (rows.length < 4) {
                    setError("Invalid sheet format: The sheet must have at least 4 rows to be processed correctly.");
                    setLoading(false);
                    return;
                }
                
                // Dates are expected in the 2nd row (index 1), starting from the 7th column (index 6)
                const dateHeaderRow = rows[1].split(',').map(h => h.trim());
                const dates = dateHeaderRow.slice(6).filter(Boolean);
                
                let userRowCols: string[] | undefined;

                // Student data starts from the 4th row (index 3)
                for (let i = 3; i < rows.length; i++) {
                    const cols = rows[i].split(',');
                    const sheetRollNumber = cols[0]?.trim(); // Match by Roll Number in Column A
                    if (sheetRollNumber === rollNumber) {
                        userRowCols = cols.map(c => c.trim());
                        break;
                    }
                }

                if (!userRowCols) {
                    setError(`Could not find your roll number "${rollNumber}" in this attendance sheet. Please check your settings and the sheet for mismatches.`);
                    setLoading(false);
                    return;
                }
                
                // Statuses also start from the 7th column (index 6)
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

                setAttendanceData({
                    totalClasses,
                    attendedClasses,
                    percentage,
                    recentRecords: records.slice(-10).reverse(),
                });

            } catch (err: any) {
                console.error("Error fetching or parsing attendance data:", err);
                setError("Could not load attendance data. The link might be invalid, not publicly shared as a CSV, or the format is incorrect.");
                toast({
                    title: "Fetch Error",
                    description: "Failed to load attendance data from the provided link.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [selectedSubject, toast, user, rollNumber]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Tracker</CardTitle>
                    <CardDescription>View your attendance for subjects in Semester {currentSemester}. This data is pulled live from Google Sheets.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!currentSemester ? (
                         <p className="text-muted-foreground">Please set your current semester in Settings to view your attendance.</p>
                    ) : (
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={loading || subjectsForSemester.length === 0}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjectsForSemester.map(subject => (
                                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardContent>
            </Card>

            {loading && (
                 <Card>
                    <CardContent className="flex justify-center items-center p-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </CardContent>
                </Card>
            )}

            {error && !loading && (
                 <Card>
                    <CardContent className="flex flex-col text-center justify-center items-center p-10 text-destructive">
                        <AlertCircle className="h-10 w-10 mb-4"/>
                        <p className="font-semibold">An Error Occurred</p>
                        <p className="text-sm max-w-md">{error}</p>
                    </CardContent>
                </Card>
            )}
            
            {attendanceData && !loading && (
                 <Card>
                    <CardHeader>
                        <CardTitle>{selectedSubject}</CardTitle>
                        <CardDescription>Overall attendance summary and recent records.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-lg font-medium">Overall Performance</h3>
                                <p className="text-sm text-muted-foreground">
                                    Attended: <span className="font-bold text-foreground">{attendanceData.attendedClasses}</span> / {attendanceData.totalClasses}
                                </p>
                            </div>
                            <Progress value={attendanceData.percentage} />
                             <p className="text-right font-bold text-lg text-primary">{attendanceData.percentage.toFixed(1)}%</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Recent Records</h3>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attendanceData.recentRecords.length > 0 ? (
                                            attendanceData.recentRecords.map((record, index) => (
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
                                                <TableCell colSpan={2} className="text-center text-muted-foreground">No recent records to display.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
