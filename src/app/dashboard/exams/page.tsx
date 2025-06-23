import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const exams = [
  { name: "Calculus Midterm", subject: "Math", date: "2024-05-15", obtained: 88, total: 100 },
  { name: "Modern Physics Final", subject: "Science", date: "2024-05-20", obtained: 92, total: 100 },
  { name: "World History Paper", subject: "History", date: "2024-04-28", obtained: 78, total: 100 },
  { name: "Shakespeare Analysis", subject: "English", date: "2024-05-10", obtained: 85, total: 100 },
];

const getGradeColor = (percentage: number) => {
  if (percentage >= 90) return "bg-green-500/20 text-green-700";
  if (percentage >= 80) return "bg-blue-500/20 text-blue-700";
  if (percentage >= 70) return "bg-yellow-500/20 text-yellow-700";
  return "bg-red-500/20 text-red-700";
}

export default function ExamsPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Exam Records</CardTitle>
            <CardDescription>Manage your past exam results.</CardDescription>
          </div>
          <Button>
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
            {exams.map((exam, index) => {
              const percentage = Math.round((exam.obtained / exam.total) * 100);
              return (
                <TableRow key={index}>
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
