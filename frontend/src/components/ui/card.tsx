import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return (
        <div className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)}>
            {children}
        </div>
    );
}

export function CardHeader({ children, className }: CardProps) {
    return <div className={cn("px-6 py-4 border-b border-slate-100", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
    return <h3 className={cn("text-sm font-semibold text-slate-900", className)}>{children}</h3>;
}

export function CardContent({ children, className }: CardProps) {
    return <div className={cn("px-6 py-4", className)}>{children}</div>;
}
