import { Inbox } from "lucide-react";

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export function EmptyState({ title = "No data yet", message = "Nothing to show here.", icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                {icon ?? <Inbox className="w-6 h-6 text-slate-500" />}
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-1">{title}</h3>
            <p className="text-sm text-slate-500 max-w-md">{message}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
