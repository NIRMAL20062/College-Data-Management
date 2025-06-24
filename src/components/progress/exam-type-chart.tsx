
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

interface ExamTypeChartProps {
  data: { name: string; AverageScore: number; Exams: number; }[];
}

const chartConfig = {
  AverageScore: {
    label: "Average Score (%)",
    color: "hsl(var(--chart-1))",
  },
  Exams: {
    label: "Exams Recorded",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ExamTypeChart({ data }: ExamTypeChartProps) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--chart-1))" domain={[0, 100]} />
          <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" allowDecimals={false} />
          <Tooltip
            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
            content={<ChartTooltipContent />}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="AverageScore" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="Exams" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

    