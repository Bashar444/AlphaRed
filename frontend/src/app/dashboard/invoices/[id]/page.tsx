"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { invoices } from "@/lib/api";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function InvoiceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<Record<string, unknown> | null>(null);
    const [items, setItems] = useState<Record<string, unknown>[]>([]);
    const [payments, setPayments] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPay, setShowPay] = useState(false);
    const [payAmount, setPayAmount] = useState("");
    const [payNote, setPayNote] = useState("");

    const load = () => {
        if (!id) return;
        const iid = Number(id);
        invoices.get(iid).then((d) => {
            setInvoice(d);
            setItems((d?.items as Record<string, unknown>[]) ?? []);
            setPayments((d?.payments as Record<string, unknown>[]) ?? []);
        }).finally(() => setLoading(false));
    };

    useEffect(load, [id]);

    const addPayment = async () => {
        if (!payAmount || !id) return;
        await invoices.addPayment(Number(id), { amount: Number(payAmount), note: payNote, payment_date: new Date().toISOString().slice(0, 10) });
        setShowPay(false);
        setPayAmount("");
        setPayNote("");
        load();
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;
    if (!invoice) return <EmptyState title="Not found" />;

    const sym = String(invoice.currency_symbol || "$");

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href="/dashboard/invoices"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button></Link>
                <h1 className="text-2xl font-bold text-white">Invoice #{String(invoice.id)}</h1>
                <StatusBadge label={String(invoice.status ?? "").replace(/_/g, " ")} variant="info" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-6 text-sm text-slate-300 space-y-1">
                    <p><span className="text-slate-500">Client:</span> {String(invoice.company_name ?? "—")}</p>
                    <p><span className="text-slate-500">Due:</span> {String(invoice.due_date ?? "—")}</p>
                    <p><span className="text-slate-500">Total:</span> {sym}{Number(invoice.invoice_total ?? 0).toFixed(2)}</p>
                </CardContent></Card>
                <Card className="bg-slate-900 border-slate-800"><CardContent className="pt-6 text-sm text-slate-300 space-y-1">
                    <p><span className="text-slate-500">Paid:</span> {sym}{Number(invoice.payment_received ?? 0).toFixed(2)}</p>
                    <p><span className="text-slate-500">Balance:</span> {sym}{(Number(invoice.invoice_total ?? 0) - Number(invoice.payment_received ?? 0)).toFixed(2)}</p>
                </CardContent></Card>
                <Card className="bg-slate-900 border-slate-800 flex items-center justify-center">
                    <Button size="sm" className="gap-1" onClick={() => setShowPay(true)}><Plus className="w-4 h-4" /> Record Payment</Button>
                </Card>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">Items</CardTitle></CardHeader>
                <CardContent>
                    {items.length === 0 ? <p className="text-slate-500 text-sm">No items</p> : (
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-slate-800 text-slate-400">
                                <th className="px-4 py-2 text-left">Title</th><th className="px-4 py-2 text-right">Qty</th><th className="px-4 py-2 text-right">Rate</th><th className="px-4 py-2 text-right">Total</th>
                            </tr></thead>
                            <tbody>{items.map((it, i) => (
                                <tr key={i} className="border-b border-slate-800/50">
                                    <td className="px-4 py-2 text-slate-300">{String(it.title ?? "")}</td>
                                    <td className="px-4 py-2 text-right text-slate-400">{String(it.quantity ?? "")}</td>
                                    <td className="px-4 py-2 text-right text-slate-400">{sym}{Number(it.rate ?? 0).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right text-slate-300">{sym}{Number(it.total ?? 0).toFixed(2)}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader><CardTitle className="text-white">Payments</CardTitle></CardHeader>
                <CardContent>
                    {payments.length === 0 ? <p className="text-slate-500 text-sm">No payments recorded</p> : (
                        <table className="w-full text-sm">
                            <thead><tr className="border-b border-slate-800 text-slate-400">
                                <th className="px-4 py-2 text-left">Date</th><th className="px-4 py-2 text-right">Amount</th><th className="px-4 py-2 text-left">Note</th>
                            </tr></thead>
                            <tbody>{payments.map((p, i) => (
                                <tr key={i} className="border-b border-slate-800/50">
                                    <td className="px-4 py-2 text-slate-300">{String(p.payment_date ?? "")}</td>
                                    <td className="px-4 py-2 text-right text-emerald-400">{sym}{Number(p.amount ?? 0).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-slate-400">{String(p.note ?? "")}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            <Modal open={showPay} onClose={() => setShowPay(false)} title="Record Payment" footer={<><Button variant="ghost" onClick={() => setShowPay(false)}>Cancel</Button><Button onClick={addPayment}>Save</Button></>}>
                <div className="space-y-4">
                    <div><label className="text-sm text-slate-400">Amount</label><Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-slate-800 border-slate-700 text-white" /></div>
                    <div><label className="text-sm text-slate-400">Note</label><Input value={payNote} onChange={(e) => setPayNote(e.target.value)} className="bg-slate-800 border-slate-700 text-white" /></div>
                </div>
            </Modal>
        </div>
    );
}
