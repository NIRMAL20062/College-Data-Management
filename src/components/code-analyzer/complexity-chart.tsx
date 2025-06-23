// src/components/code-analyzer/complexity-chart.tsx
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

interface ComplexityChartProps {
  result: string;
}

const complexityData = [
  { name: 'O(1)', value: 10 },
  { name: 'O(log n)', value: 20 },
  { name: 'O(n)', value: 30 },
  { name: 'O(n log n)', value: 40 },
  { name: 'O(n²)', value: 50 },
  { name: 'O(2ⁿ)', value: 60 },
  { name: 'O(n!)', value: 70 },
];

// Re-map common variations to match the chart data
const mapComplexityToName = (complexity: string) => {
  const cleaned = complexity.replace(/\s/g, '').replace('^', '²').replace('**', 'ⁿ');
  const found = complexityData.find(d => d.name === cleaned);
  return found ? found.name : complexity;
}

export function ComplexityChart({ result }: ComplexityChartProps) {
  const mappedResult = mapComplexityToName(result);

  return (
    <div className="w-full h-64">
        <ChartContainer config={{}} className="min-h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complexityData} layout="vertical" margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {complexityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === mappedResult ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
    </div>
  )
}
