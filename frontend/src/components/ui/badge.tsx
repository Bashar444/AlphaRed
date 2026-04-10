import { cn } from "@/lib/utils";

interface BadgeProps {
    variant?: "success" | "warning" | "danger" | "info" | "default";
    children: React.ReactNode;
    className?: string;
}

const variants: Record<string, string> = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    default: "bg-slate-50 text-slate-600 border-slate-200",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border",
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
