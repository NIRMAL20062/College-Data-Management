"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

type Exam = {
    userId: string;
    subject: string;
    obtained: number;
    total: number;
};

interface ClassAverageChartProps {
  userExams: Exam[];
  allExams: Exam[];
  userId: string;
}

const chartConfig = {
  yourAverage: {
    label: "Your Avg %",
    color: "hsl(var(--chart-1))",
  },
  classAverage: {
    label: "Class Avg %",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export function ClassAverageChart({ userExams, allExams, userId }: ClassAverageChartProps) {
  
  const chartData = useMemo(() => {
    if (!userExams || userExams.length === 0) return [];

    const userSubjects = [...new Set(userExams.map(exam => exam.subject))];

    return userSubjects.map(subject => {
        const userExamsForSubject = userExams.filter(e => e.subject === subject);
        const userTotalPercentage = userExamsForSubject.reduce((sum, exam) => sum + (exam.obtained / exam.total) * 100, 0);
        const yourAverage = userTotalPercentage / userExamsForSubject.length;

        const allExamsForSubject = allExams.filter(e => e.subject === subject);
        let classAverage = 0;
        let studentCount = 0;
        if (allExamsForSubject.length > 0) {
            const classTotalPercentage = allExamsForSubject.reduce((sum, exam) => sum + (exam.obtained / exam.total) * 100, 0);
            classAverage = classTotalPercentage / allExamsForSubject.length;
            studentCount = new Set(allExamsForSubject.map(e => e.userId)).size;
        }

        return {
            subject,
            yourAverage: parseFloat(yourAverage.toFixed(1)),
            classAverage: parseFloat(classAverage.toFixed(1)),
            students: studentCount,
        };
    });
}, [userExams, allExams]);

  if (!chartData || chartData.length === 0) {
    return <div className="text-center text-muted-foreground p-10">No data available for this chart.</div>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 border bg-background/95 backdrop-blur-sm rounded-lg shadow-lg">
          <p className="font-bold text-lg mb-2">{label}</p>
          <div className="space-y-1">
             <p className="text-sm font-medium flex justify-between items-center" style={{ color: chartConfig.yourAverage.color }}>
                <span>{`${chartConfig.yourAverage.label}:`}</span>
                <span className="font-bold ml-4">{`${payload[0].value}%`}</span>
            </p>
            <p className="text-sm font-medium flex justify-between items-center" style={{ color: chartConfig.classAverage.color }}>
                <span>{`${chartConfig.classAverage.label}:`}</span>
                <span className="font-bold ml-4">{`${payload[1].value}%`}</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-3 pt-2 border-t">
            Class average based on {payload[0].payload.students} student(s)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="subject" 
            tickLine={false} 
            axisLine={false} 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            angle={-45} 
            textAnchor="end" 
            interval={0}
            height={80}
            dy={10}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }} />
          <Legend />
          <Bar dataKey="yourAverage" name="Your Avg %" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="classAverage" name="Class Avg %" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
