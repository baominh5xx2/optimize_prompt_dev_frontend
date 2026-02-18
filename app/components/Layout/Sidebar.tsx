
import { useEffect, useState } from "react";
import { api } from "../../lib/api";

interface SessionItem {
    id: string;
    title: string;
    status: string;
    message_count: number;
    updated_at: string;
}

interface SidebarProps {
    onNewOptimization?: () => void;
    activeSessionId?: string | null;
    onSelectSession?: (sessionId: string) => void;
}

export function Sidebar({ onNewOptimization, activeSessionId, onSelectSession }: SidebarProps) {
    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const data = await api.listSessions();
            setSessions(data.sessions);
        } catch {
            // Not logged in or network error — show empty
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleNewOpt = async () => {
        try {
            const session = await api.createSession();
            setSessions((prev) => [
                { ...session, message_count: 0, updated_at: session.created_at },
                ...prev,
            ]);
            onSelectSession?.(session.id);
            onNewOptimization?.();
        } catch {
            // Fallback: just trigger the modal
            onNewOptimization?.();
        }
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <aside className="w-64 bg-slate-50 dark:bg-[#0f0f1a] border-r border-slate-200 dark:border-[#232348] flex flex-col justify-between shrink-0">
            <div className="flex flex-col py-4 px-3 gap-1 overflow-hidden">
                <div className="px-3 mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Workspace
                    </p>
                </div>
                <button
                    onClick={handleNewOpt}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all mb-4 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span className="text-sm font-bold">New Optimization</span>
                </button>

                {/* Session History */}
                <div className="px-3 mb-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Sessions
                    </p>
                </div>
                <div className="flex flex-col gap-0.5 overflow-y-auto flex-1 custom-scrollbar">
                    {loading && (
                        <div className="px-3 py-2 text-xs text-slate-500">Loading...</div>
                    )}
                    {!loading && sessions.length === 0 && (
                        <div className="px-3 py-2 text-xs text-slate-500">No sessions yet</div>
                    )}
                    {sessions.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => onSelectSession?.(s.id)}
                            className={`flex flex-col gap-0.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${activeSessionId === s.id
                                    ? "bg-white dark:bg-[#1a1a2e] text-primary font-medium border border-slate-200 dark:border-[#232348]"
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1a1a2e]"
                                }`}
                        >
                            <span className="text-sm truncate max-w-full">{s.title}</span>
                            <span className="text-[10px] text-slate-500">
                                {s.message_count} msgs • {formatTime(s.updated_at)}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-[#232348]">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-500">API Usage</span>
                    <span className="text-xs font-bold text-primary">84%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-[#232348] rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[84%] rounded-full"></div>
                </div>
            </div>
        </aside>
    );
}
