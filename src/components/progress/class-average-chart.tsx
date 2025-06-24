
"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
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
    if (allExams.length === 0) return [];

    const subjectData: Record<string, {
        userTotal: number;
        userCount: number;
        classTotal: number;
        classCount: number;
        studentIds: Set<string>;
    }> = {};

    // Process all exams to calculate class averages and unique student counts
    allExams.forEach(exam => {
        if (!subjectData[exam.subject]) {
            subjectData[exam.subject] = {
                userTotal: 0,
                userCount: 0,
                classTotal: 0,
                classCount: 0,
                studentIds: new Set(),
            };
        }
        const percentage = (exam.obtained / exam.total) * 100;
        subjectData[exam.subject].classTotal += percentage;
        subjectData[exam.subject].classCount++;
        subjectData[exam.subject].studentIds.add(exam.userId);
    });

    // Process user's exams to calculate personal averages
    userExams.forEach(exam => {
        if (subjectData[exam.subject]) {
            const percentage = (exam.obtained / exam.total) * 100;
            subjectData[exam.subject].userTotal += percentage;
            subjectData[exam.subject].userCount++;
        }
    });

    return Object.entries(subjectData).map(([subject, data]) => ({
        subject,
        yourAverage: data.userCount > 0 ? parseFloat((data.userTotal / data.userCount).toFixed(1)) : 0,
        classAverage: parseFloat((data.classTotal / data.classCount).toFixed(1)),
        students: data.studentIds.size,
    }));
  }, [userExams, allExams, userId]);

  if (!chartData || chartData.length === 0) {
    return <div className="text-center text-muted-foreground p-10">No data available for this chart.</div>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 border bg-background rounded-lg shadow-lg">
          <p className="font-bold">{label}</p>
          <p style={{ color: chartConfig.yourAverage.color }}>
            {`${chartConfig.yourAverage.label}: ${payload[0].value}%`}
          </p>
          <p style={{ color: chartConfig.classAverage.color }}>
            {`${chartConfig.classAverage.label}: ${payload[1].value}%`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Based on data from {payload[0].payload.students} student(s)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="subject" tickLine={false} axisLine={false} stroke="#888888" fontSize={12} tick={{ angle: -45, textAnchor: 'end' }} height={70}/>
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
