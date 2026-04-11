"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface LineChartWidgetProps {
    title: string;
    data: Array<Record<string, unknown>>;
    xKey: string;
    yKey: string;
    color?: string;
    loading?: boolean;
}

export function LineChartWidget({
    title,
    data,
    xKey,
    yKey,
    color = "#7c3aed",
    loading = false,
}: LineChartWidgetProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-[220px] flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
                        No data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis
                                dataKey={xKey}
                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey={yKey}
                                stroke={color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
