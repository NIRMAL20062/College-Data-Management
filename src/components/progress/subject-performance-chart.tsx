
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

type Exam = {
    subject: string;
    obtained: number;
    total: number;
};

interface SubjectPerformanceChartProps {
  data: Exam[];
}

const chartConfig = {
  obtained: {
    label: "Your Score",
    color: "hsl(var(--chart-1))",
  },
  total: {
    label: "Total Marks",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function SubjectPerformanceChart({ data }: SubjectPerformanceChartProps) {
  const chartData = data.map(exam => ({
    subject: exam.subject,
    obtained: exam.obtained,
    total: exam.total,
  }));

  if (!chartData || chartData.length === 0) {
    return <div className="text-center text-muted-foreground p-10">No data available for this chart.</div>;
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="subject"
            tickLine={false}
            axisLine={false}
            tickFormatter={() => ""}
          />
          <YAxis />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
            content={<ChartTooltipContent />}
          />
          <Legend />
          <Bar dataKey="total" name="Total Marks" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="obtained" name="Your Score" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
