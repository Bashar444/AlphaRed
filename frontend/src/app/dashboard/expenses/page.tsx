"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { expenses } from "@/lib/api";
import { Plus, Loader2, DollarSign } from "lucide-react";

interface Expense {
    id: number;
    title: string;
    amount: number;
    expense_date: string;
    category_title: string;
    project_title: string;
    [key: string]: unknown;
}

export default function ExpensesPage() {
    const [data, setData] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        expenses.list().then((d) => setData(d ?? [])).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const total = data.reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const columns: Column<Expense>[] = [
        { key: "id", label: "#", sortable: true },
        { key: "title", label: "Title", sortable: true },
        { key: "category_title", label: "Category", sortable: true },
        { key: "amount", label: "Amount", sortable: true, render: (r) => <span className="text-red-600 font-medium">${Number(r.amount || 0).toFixed(2)}</span> },
        { key: "expense_date", label: "Date", sortable: true },
        { key: "project_title", label: "Project" },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
                <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> New Expense</Button>
            </div>

            <Card>
                <CardContent className="pt-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><DollarSign className="w-5 h-5 text-red-500" /></div>
                    <div>
                        <p className="text-sm text-slate-500">Total Expenses</p>
                        <p className="text-xl font-bold text-slate-900">${total.toFixed(2)}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>All Expenses</CardTitle></CardHeader>
                <CardContent>
                    {data.length === 0 ? (
                        <EmptyState title="No expenses" message="Record your first expense." />
                    ) : (
                        <DataTable columns={columns} data={data} searchKey="title" />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
