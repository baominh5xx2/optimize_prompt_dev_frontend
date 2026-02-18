
import { useEffect, useState, useRef } from "react";

export interface AgentStep {
    agent: string;
    label: string;
    icon: string;
    status: "pending" | "active" | "completed" | "error";
    duration?: number;
    preview?: string;
    content?: string; // Full reasoning content — shown when expanded
}

interface ProcessingModalProps {
    isOpen: boolean;
    steps: AgentStep[];
    onCancel: () => void;
}

export function ProcessingModal({ isOpen, steps, onCancel }: ProcessingModalProps) {
    const [elapsed, setElapsed] = useState(0);
    const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const hasActiveSteps = steps.some((s) => s.status === "active" || s.status === "pending");
        if (isOpen && hasActiveSteps) {
            setElapsed(0);
            setExpandedAgent(null);
            timerRef.current = setInterval(() => setElapsed((t) => t + 0.1), 100);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleExpand = (agent: string, hasContent: boolean) => {
        if (!hasContent) return;
        setExpandedAgent((prev) => (prev === agent ? null : agent));
    };

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-[#15152a] rounded-2xl shadow-2xl border border-[#323267] overflow-hidden flex flex-col relative neon-glow max-h-[85vh]">
                {/* Top gradient */}
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent absolute top-0 left-0 right-0 opacity-80"></div>

                {/* Header */}
                <div className="px-6 py-4 border-b border-[#232348] flex items-center justify-between bg-[#191933] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center size-8">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-20 animate-ping"></span>
                            <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
                        </div>
                        <div>
                            <h3 className="text-white text-base font-bold tracking-tight">
                                Multi-Agent Processing
                            </h3>
                            <p className="text-[#9292c9] text-xs">
                                Orchestrating specialized AI agents • {elapsed.toFixed(1)}s
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-[#565685] hover:text-white transition-colors rounded-full p-1 hover:bg-[#232348] cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Steps — scrollable */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-1 bg-[#111122] custom-scrollbar">
                    {steps.length === 0 && (
                        <div className="text-center text-[#565685] text-sm py-4">
                            Initializing pipeline...
                        </div>
                    )}

                    {steps.map((step, idx) => {
                        const isLast = idx === steps.length - 1;
                        const isCompleted = step.status === "completed";
                        const isActive = step.status === "active";
                        const isPending = step.status === "pending";
                        const isError = step.status === "error";
                        const hasContent = !!step.content;
                        const isExpanded = expandedAgent === step.agent;

                        return (
                            <div key={step.agent + idx} className="relative flex flex-col">
                                {/* Connector line */}
                                {!isLast && (
                                    <div className={`absolute left-[15px] top-8 w-px h-full ${isCompleted ? "bg-emerald-500/30" : "bg-[#232348]"}`}></div>
                                )}

                                {/* Step row */}
                                <div
                                    className={`relative flex gap-3 items-start p-3 rounded-xl transition-all ${isCompleted && hasContent ? "cursor-pointer hover:bg-[#191933]" : ""} ${isExpanded ? "bg-[#191933]" : ""}`}
                                    onClick={() => toggleExpand(step.agent, isCompleted && hasContent)}
                                >
                                    {/* Status icon */}
                                    <div
                                        className={`relative z-10 flex-none size-8 rounded-full flex items-center justify-center shrink-0 ${isCompleted
                                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                            : isActive
                                                ? "bg-primary/10 border border-primary text-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                                                : isError
                                                    ? "bg-red-500/10 border border-red-500/30 text-red-500"
                                                    : "bg-[#191933] border border-[#323267] text-[#565685]"
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-lg ${isActive ? "animate-spin" : ""}`}>
                                            {isCompleted ? "check" : isActive ? "sync" : isError ? "error" : "hourglass_empty"}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-semibold ${isActive ? "text-white" : isPending ? "text-[#9292c9]" : "text-white"}`}>
                                                {step.label}
                                            </span>
                                            <span className={`text-xs ${isCompleted ? "text-emerald-500" : isActive ? "text-primary" : isError ? "text-red-400" : "text-[#565685]"}`}>
                                                {isCompleted
                                                    ? (step.duration && step.duration > 0 ? `${step.duration}s` : "")
                                                    : isActive
                                                        ? "Processing..."
                                                        : isError
                                                            ? "Error"
                                                            : "Waiting..."}
                                            </span>
                                        </div>

                                        {/* Active: show preview */}
                                        {isActive && step.preview && (
                                            <div className="mt-1.5 p-2 bg-[#0a0a16] rounded border border-[#232348] text-[10px] font-mono text-gray-400">
                                                <p className="truncate text-primary">&gt; {step.preview}</p>
                                                <span className="inline-block w-1.5 h-3 bg-primary animate-pulse align-middle"></span>
                                            </div>
                                        )}

                                        {/* Completed with content: show expand hint */}
                                        {isCompleted && hasContent && !isActive && (
                                            <p className="text-[10px] text-[#565685] mt-0.5">
                                                {isExpanded ? "Click to collapse" : "Click to view reasoning ↓"}
                                            </p>
                                        )}
                                    </div>

                                    {/* Right icon */}
                                    <div className={`shrink-0 ${isActive ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" : isPending ? "opacity-30" : "opacity-60"}`}>
                                        <span className={`material-symbols-outlined ${isActive ? "text-primary" : "text-[#9292c9]"}`}>
                                            {step.icon}
                                        </span>
                                    </div>
                                </div>

                                {/* Expanded reasoning content */}
                                {isExpanded && step.content && (
                                    <div className="ml-11 mb-2 mr-2 p-3 bg-[#0a0a16] rounded-lg border border-[#232348] text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
                                        {step.content}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="bg-[#15152a] px-6 py-3 border-t border-[#232348] flex justify-end items-center shrink-0">
                    <button
                        onClick={onCancel}
                        className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded hover:bg-red-400/10 border border-transparent hover:border-red-400/20 cursor-pointer"
                    >
                        Cancel Generation
                    </button>
                </div>
            </div>
        </div>
    );
}
