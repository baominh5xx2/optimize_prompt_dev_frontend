
import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { api } from "../../lib/api";
import type { AgentStep } from "./ProcessingModal";
import { PromptRankCard } from "./PromptRankCard";

interface ChatMessage {
    id?: string;
    role: string;
    content: string;
    agent_name?: string | null;
    timestamp?: string;
    metadata_?: Record<string, unknown> | null;
}

interface ChatInterfaceProps {
    sessionId: string | null;
    knowledgeContext: { template_instructions: string; context_content: string } | null;
    onProcessingStart: (steps: AgentStep[]) => void;
    onProcessingEnd: () => void;
    onStepsUpdate: (updater: (prev: AgentStep[]) => AgentStep[]) => void;
    onSessionCreated: (sessionId: string) => void;
    onViewReasoning: () => void;
    hasReasoningSteps: boolean;
}

export function ChatInterface({
    sessionId,
    knowledgeContext,
    onProcessingStart,
    onProcessingEnd,
    onStepsUpdate,
    onSessionCreated,
    onViewReasoning,
    hasReasoningSteps,
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    // Load messages when session changes
    useEffect(() => {
        if (!sessionId) {
            setMessages([]);
            return;
        }
        (async () => {
            try {
                const msgs = await api.getMessages(sessionId);
                setMessages(
                    msgs.map((m) => ({
                        id: m.id,
                        role: m.role,
                        content: m.content,
                        agent_name: m.agent_name,
                        timestamp: new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        metadata_: m.metadata_,
                    }))
                );
            } catch {
                setMessages([]);
            }
        })();
    }, [sessionId]);

    // Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || sending) return;

        // Auto-create session if none exists
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            try {
                const session = await api.createSession();
                currentSessionId = session.id;
                onSessionCreated(session.id);
            } catch (err) {
                console.error("Failed to create session:", err);
                return;
            }
        }

        const userMsg = input.trim();
        setInput("");
        setSending(true);

        // Optimistic user message
        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: userMsg,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            },
        ]);

        // Initial pipeline steps
        const initialSteps: AgentStep[] = [
            { agent: "supervisor", label: "Orchestrating Pipeline", icon: "smart_toy", status: "active" },
            { agent: "diagnose_agent", label: "Analyzing Prompt Issues", icon: "psychology", status: "pending" },
            { agent: "rewriter_agent", label: "Generating Candidate Prompts", icon: "edit_note", status: "pending" },
            { agent: "evaluate_agent", label: "Evaluating & Ranking Results", icon: "leaderboard", status: "pending" },
            { agent: "answer_agent", label: "Synthesizing Final Answer", icon: "auto_awesome", status: "pending" },
        ];
        onProcessingStart(initialSteps);

        // Stream agent events
        const controller = api.streamAgentChat(
            currentSessionId,
            userMsg,
            knowledgeContext,
            (event, data: any) => {
                if (event === "step_start") {
                    onStepsUpdate((prev) =>
                        prev.map((s) =>
                            s.agent === data.agent
                                ? { ...s, status: "active" as const, label: data.label, icon: data.icon }
                                : s.status === "active"
                                    ? { ...s, status: "completed" as const }
                                    : s
                        )
                    );
                } else if (event === "step_complete") {
                    onStepsUpdate((prev) =>
                        prev.map((s) =>
                            s.agent === data.agent
                                ? { ...s, status: "completed" as const, duration: data.duration, preview: data.preview, content: data.content }
                                : s
                        )
                    );
                } else if (event === "reasoning") {
                    // Reasoning content: update modal step content only, do NOT add to chat
                    onStepsUpdate((prev) =>
                        prev.map((s) =>
                            s.agent === data.agent
                                ? { ...s, content: data.content }
                                : s
                        )
                    );
                } else if (event === "message") {
                    // Only answer_agent messages go to chat
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: data.role,
                            content: data.content,
                            agent_name: data.agent_name,
                            timestamp: new Date().toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            }),
                        },
                    ]);
                } else if (event === "error") {
                    onStepsUpdate((prev) =>
                        prev.map((s) => (s.status === "active" ? { ...s, status: "error" as const } : s))
                    );
                }
            },
            () => {
                // All done
                onStepsUpdate((prev) => prev.map((s) => ({ ...s, status: "completed" as const })));
                setTimeout(() => onProcessingEnd(), 1500);
                setSending(false);
            },
            (err) => {
                console.error("SSE error:", err);
                setSending(false);
                onProcessingEnd();
            }
        );

        abortRef.current = controller;
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const getAgentLabel = (name: string | null | undefined) => {
        const labels: Record<string, string> = {
            diagnose_agent: "Diagnosis Agent",
            rewriter_agent: "Rewriter Agent",
            evaluate_agent: "Evaluator Agent",
            supervisor: "Supervisor",
        };
        return name ? labels[name] || name : "AI Assistant";
    };

    return (
        <section className="flex-1 flex flex-col min-h-0 bg-[#0f0f1a] relative">
            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-[#565685]">
                            <span className="material-symbols-outlined text-5xl mb-4 block">auto_awesome</span>
                            <p className="text-lg font-medium">Ready to optimize your prompts</p>
                            <p className="text-sm mt-1">Type your prompt below to get started</p>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => {
                    if (msg.role === "system") {
                        return (
                            <div key={idx} className="flex justify-center mb-6">
                                <span className="text-xs text-slate-500 bg-[#16162a] border border-[#232348] rounded-full px-3 py-1">
                                    {msg.content}
                                </span>
                            </div>
                        );
                    }
                    if (msg.role === "user") {
                        return (
                            <div key={idx} className="flex justify-end">
                                <div className="max-w-[80%]">
                                    <div className="bg-[#1f1f35] border border-[#232348] text-slate-200 rounded-2xl rounded-tr-sm px-5 py-3 shadow-md">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-1 text-right mr-1">
                                        You • {msg.timestamp}
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return (
                        <div key={idx} className="flex justify-start items-start gap-4 max-w-[85%]">
                            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-white text-sm">
                                    auto_awesome
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                {msg.agent_name && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] text-primary font-mono">
                                            {getAgentLabel(msg.agent_name)}
                                        </span>
                                        {hasReasoningSteps && (
                                            <button
                                                onClick={onViewReasoning}
                                                className="flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                                title="View agent reasoning steps"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">neurology</span>
                                                View Reasoning
                                            </button>
                                        )}
                                    </div>
                                )}

                                {msg.agent_name === "answer_agent" ? (
                                    (() => {
                                        const regex = /(?:🥇|🥈|🥉)\s*\*\*Rank (\d+)\*\*\s*—\s*(.+?)\n```\n([\s\S]+?)\n```/g;
                                        const cards = [];
                                        let match;
                                        while ((match = regex.exec(msg.content)) !== null) {
                                            cards.push({
                                                rank: parseInt(match[1]),
                                                title: match[2].trim(),
                                                content: match[3].trim(),
                                                icon: match[1] === "1" ? "🥇" : match[1] === "2" ? "🥈" : "🥉"
                                            });
                                        }

                                        if (cards.length > 0) {
                                            return (
                                                <div className="space-y-4 mt-2">
                                                    {cards.map((card, cIdx) => (
                                                        <PromptRankCard
                                                            key={cIdx}
                                                            rank={card.rank}
                                                            title={card.title}
                                                            content={card.content}
                                                            icon={card.icon}
                                                        />
                                                    ))}
                                                </div>
                                            );
                                        }
                                        // Fallback if regex doesn't match
                                        return (
                                            <div className="prose prose-invert prose-sm max-w-none">
                                                <p className="text-slate-300 mb-0 whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <p className="text-slate-300 mb-0 whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="p-5 bg-[#111122] border-t border-[#232348] z-10">
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-purple-600/50 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative flex items-end gap-2 bg-[#16162a] rounded-xl p-2 border border-[#232348] shadow-2xl focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                        <button
                            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#232348] transition-colors self-end mb-0.5"
                            title="Attach file"
                        >
                            <span className="material-symbols-outlined">attach_file</span>
                        </button>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={sending}
                            className="w-full bg-transparent border-none focus:ring-0 text-slate-200 placeholder:text-slate-500 py-3 max-h-32 resize-none focus:outline-none disabled:opacity-50"
                            placeholder="Ask about your code or paste a prompt to optimize..."
                            rows={1}
                            style={{ minHeight: "48px" }}
                        ></textarea>
                        <div className="flex flex-col gap-1 self-end mb-0.5">
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || sending}
                                className="bg-primary hover:bg-blue-600 disabled:opacity-50 text-white p-2.5 rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center group/send cursor-pointer"
                            >
                                <span className="material-symbols-outlined group-hover/send:translate-x-0.5 transition-transform">
                                    {sending ? "sync" : "send"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto mt-2 flex justify-between items-center text-[10px] text-slate-500 px-1">
                    <span>Markdown supported • Shift+Enter for new line</span>
                    <span>
                        {sessionId ? (
                            <>
                                Session: <span className="text-emerald-500">Active</span>
                            </>
                        ) : (
                            "No active session"
                        )}
                    </span>
                </div>
            </div>
        </section>
    );
}
