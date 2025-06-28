
// src/app/dashboard/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { semesters } from "@/lib/subjects";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const { user, isPrivileged, currentSemester, setCurrentSemester, rollNumber, setRollNumber } = useAuth();
  const { toast } = useToast();
  const [localRollNumber, setLocalRollNumber] = useState(rollNumber || "");

  useEffect(() => {
    if (rollNumber !== null) {
        setLocalRollNumber(rollNumber);
    }
  }, [rollNumber]);

  if (!user) {
    return null; // Or a loading state
  }

  const handleSemesterChange = async (value: string) => {
    const semesterNum = parseInt(value, 10);
    if (!isNaN(semesterNum)) {
      try {
        await setCurrentSemester(semesterNum);
        toast({
          title: "Semester Updated",
          description: `Your current semester has been set to Semester ${semesterNum}.`,
        });
      } catch (error) {
        toast({
          title: "Update Failed",
          description: "Could not update your semester. Please try again.",
          variant: "destructive"
        });
        console.error("Failed to update semester:", error);
      }
    }
  };

  const handleRollNumberSave = async () => {
    if (!localRollNumber.trim()) {
        toast({ title: "Input Required", description: "Roll Number cannot be empty.", variant: "destructive"});
        return;
    }
    try {
        await setRollNumber(localRollNumber);
        toast({ title: "Success", description: "Your roll number has been saved."});
    } catch (error) {
        console.error("Failed to update roll number:", error);
        toast({ title: "Update Failed", description: "Could not save your roll number.", variant: "destructive"});
    }
  };


  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your account and application settings.</CardDescription>
            </CardHeader>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Academic Profile</CardTitle>
                <CardDescription>Set your academic details to personalize your dashboard and progress views.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="max-w-xs space-y-2">
                    <Label htmlFor="current-semester">Your Current Semester</Label>
                    <Select
                        value={currentSemester?.toString() || ""}
                        onValueChange={handleSemesterChange}
                    >
                        <SelectTrigger id="current-semester">
                            <SelectValue placeholder="Select your semester" />
                        </SelectTrigger>
                        <SelectContent>
                            {semesters.map(s => (
                                <SelectItem key={s.semester} value={s.semester.toString()}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="max-w-xs space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="roll-number">Your Roll Number</Label>
                        <Input 
                            id="roll-number" 
                            placeholder="Enter university roll number"
                            value={localRollNumber}
                            onChange={(e) => setLocalRollNumber(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleRollNumberSave}>Save Roll Number</Button>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>Your current access level within AcademIQ.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <p className="font-semibold">{user.email}</p>
                        <p className="text-sm text-muted-foreground">This is your account email and access level.</p>
                    </div>
                    <Badge variant={isPrivileged ? "default" : "secondary"}>
                        {isPrivileged ? "Privileged" : "Student"}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
