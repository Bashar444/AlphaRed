"use client";

import { useEffect, useRef } from "react";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut, Pie } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

Chart.register(ArcElement, Tooltip, Legend);

const COLORS = [
    "#7c3aed", "#06b6d4", "#f59e0b", "#ef4444", "#10b981",
    "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#6366f1",
];

interface PieChartWidgetProps {
    title: string;
    labels: string[];
    values: number[];
    variant?: "pie" | "doughnut";
    loading?: boolean;
}

export function PieChartWidget({
    title,
    labels,
    values,
    variant = "doughnut",
    loading = false,
}: PieChartWidgetProps) {
    const chartRef = useRef<Chart<"doughnut" | "pie"> | null>(null);

    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, []);

    const chartData = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: COLORS.slice(0, labels.length),
                borderWidth: 2,
                borderColor: "#ffffff",
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom" as const,
                labels: {
                    padding: 12,
                    usePointStyle: true,
                    pointStyleWidth: 8,
                    font: { size: 11 },
                },
            },
        },
    };

    const ChartComponent = variant === "pie" ? Pie : Doughnut;

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-[250px] flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                    </div>
                ) : labels.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center text-sm text-slate-400">
                        No data available
                    </div>
                ) : (
                    <div className="h-[250px]">
                        <ChartComponent data={chartData} options={options} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
