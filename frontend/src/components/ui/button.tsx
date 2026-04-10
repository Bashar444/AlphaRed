import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const base =
            "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

        const variants: Record<string, string> = {
            primary: "bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500",
            secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-400",
            outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-violet-500",
            ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400",
            danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        };

        const sizes: Record<string, string> = {
            sm: "h-8 px-3 text-xs gap-1.5",
            md: "h-10 px-4 text-sm gap-2",
            lg: "h-12 px-6 text-base gap-2.5",
        };

        return (
            <button
                ref={ref}
                className={cn(base, variants[variant], sizes[size], className)}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";
