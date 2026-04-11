"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from "lucide-react";

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    searchKey?: string;
    pageSize?: number;
    onRowClick?: (row: T) => void;
    actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    searchKey,
    pageSize = 15,
    onRowClick,
    actions,
}: DataTableProps<T>) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [sortCol, setSortCol] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

    const filtered = useMemo(() => {
        let rows = data;
        if (search && searchKey) {
            const q = search.toLowerCase();
            rows = rows.filter((r) =>
                String(r[searchKey] ?? "").toLowerCase().includes(q)
            );
        }
        if (sortCol) {
            rows = [...rows].sort((a, b) => {
                const av = a[sortCol] ?? "";
                const bv = b[sortCol] ?? "";
                const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
                return sortDir === "asc" ? cmp : -cmp;
            });
        }
        return rows;
    }, [data, search, searchKey, sortCol, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

    function handleSort(key: string) {
        if (sortCol === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortCol(key); setSortDir("asc"); }
    }

    return (
        <div className="space-y-4">
            {searchKey && (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/50">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="px-4 py-3 text-left font-medium text-slate-400 whitespace-nowrap"
                                >
                                    {col.sortable ? (
                                        <button className="flex items-center gap-1 hover:text-white" onClick={() => handleSort(col.key)}>
                                            {col.label}
                                            <ArrowUpDown className="w-3 h-3" />
                                        </button>
                                    ) : col.label}
                                </th>
                            ))}
                            {actions && <th className="px-4 py-3 text-right font-medium text-slate-400">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {paged.length === 0 ? (
                            <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-slate-500">No data found</td></tr>
                        ) : paged.map((row, i) => (
                            <tr
                                key={i}
                                className={`border-b border-slate-800/50 ${onRowClick ? "cursor-pointer hover:bg-slate-800/50" : ""}`}
                                onClick={() => onRowClick?.(row)}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 text-slate-300 whitespace-nowrap">
                                        {col.render ? col.render(row) : String(row[col.key] ?? "")}
                                    </td>
                                ))}
                                {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span>Page {page + 1} of {totalPages}</span>
                        <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
