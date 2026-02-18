
import { useState } from "react";

interface KnowledgeBaseProps {
    templateInstructions: string;
    contextContent: string;
    onTemplateChange: (value: string) => void;
    onContextChange: (value: string) => void;
}

/** Default structure template that guides users to fill in project context. */
const DEFAULT_TEMPLATE = `You are helping me optimize prompts for my project. Here is my project context:

## Project Overview
[Project name, purpose, and main functionality]

## Tech Stack
- Language: [e.g., Python 3.12, TypeScript 5.x]
- Framework: [e.g., FastAPI, React, Next.js]
- Database: [e.g., PostgreSQL, MongoDB]
- Key Libraries: [e.g., SQLAlchemy, LangChain, TailwindCSS]

## Architecture
[High-level description: monolith vs microservices, API structure, folder layout]

## Key Constraints
- [Performance requirements, e.g., response time < 200ms]
- [Security considerations, e.g., JWT auth, rate limiting]
- [Coding style/conventions, e.g., PEP 8, ESLint rules]
- [Max token budget or context window limits]

## Target Audience
[Who will consume the optimized prompts: developers, end-users, AI agents, etc.]

## Specific Goals
- [What the optimized prompt should achieve]
- [Edge cases or tricky scenarios to handle]
- [Output format preferences: JSON, markdown, plain text, etc.]`;

export function KnowledgeBase({
    templateInstructions,
    contextContent,
    onTemplateChange,
    onContextChange,
}: KnowledgeBaseProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedTemplate, setCopiedTemplate] = useState(false);
    const [copiedContext, setCopiedContext] = useState(false);

    const copyToClipboard = (text: string, which: "template" | "context") => {
        navigator.clipboard.writeText(text).then(() => {
            if (which === "template") {
                setCopiedTemplate(true);
                setTimeout(() => setCopiedTemplate(false), 1500);
            } else {
                setCopiedContext(true);
                setTimeout(() => setCopiedContext(false), 1500);
            }
        });
    };

    const handleResetTemplate = () => {
        onTemplateChange(DEFAULT_TEMPLATE);
    };

    const hasContent = templateInstructions.length > 0 || contextContent.length > 0;

    return (
        <section className="border-b border-[#232348] flex flex-col bg-[#111122] shrink-0">
            {/* Header — always visible, click to toggle */}
            <div
                className="flex items-center justify-between px-6 py-3 bg-[#16162a] cursor-pointer select-none hover:bg-[#1a1a30] transition-colors"
                onClick={() => setIsOpen((v) => !v)}
            >
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">
                        dataset
                    </span>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                        Knowledge Base Context
                    </h2>
                    {hasContent && (
                        <span className="bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded border border-primary/30">
                            Active
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] text-slate-500">
                        Sent with each message
                    </span>
                    {isOpen && (
                        <>
                            <button
                                onClick={handleResetTemplate}
                                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                                Reset Template
                            </button>
                        </>
                    )}
                    {/* Chevron toggle */}
                    <span
                        className={`material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    >
                        expand_more
                    </span>
                </div>
            </div>

            {/* Collapsible body */}
            {isOpen && (
                <div className="flex h-[280px] overflow-hidden">
                    {/* Left: Template Instruction */}
                    <div className="w-1/3 border-r border-[#232348] p-5 flex flex-col gap-4 bg-[#131325]">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-white font-medium">
                                    1. Structure Template
                                </h3>
                                <button
                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(templateInstructions || DEFAULT_TEMPLATE, "template"); }}
                                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded hover:bg-[#232348]"
                                    title="Copy template"
                                >
                                    <span className="material-symbols-outlined text-[14px]">{copiedTemplate ? "check" : "content_copy"}</span>
                                    {copiedTemplate ? "Copied!" : "Copy"}
                                </button>
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed">
                                Define the structure for your codebase context. This template guides how the AI understands your project.
                            </p>
                        </div>
                        <textarea
                            value={templateInstructions}
                            onChange={(e) => onTemplateChange(e.target.value)}
                            className="flex-1 bg-[#0f0f1a] rounded border border-[#232348] p-3 font-mono text-xs text-slate-300 resize-none focus:outline-none focus:border-primary/50 disabled:opacity-50"
                            placeholder={DEFAULT_TEMPLATE}
                            spellCheck={false}
                        />
                    </div>
                    {/* Right: Context Input Area */}
                    <div className="flex-1 flex flex-col relative code-editor-bg">
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                            <button
                                onClick={() => copyToClipboard(contextContent, "context")}
                                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer px-1.5 py-0.5 rounded bg-[#232348]/80 hover:bg-[#232348] border border-white/5"
                                title="Copy context"
                            >
                                <span className="material-symbols-outlined text-[14px]">{copiedContext ? "check" : "content_copy"}</span>
                                {copiedContext ? "Copied!" : "Copy"}
                            </button>
                            <span className="bg-[#232348] text-slate-300 text-[10px] px-2 py-1 rounded font-mono border border-white/5">
                                Markdown
                            </span>
                        </div>
                        <textarea
                            value={contextContent}
                            onChange={(e) => onContextChange(e.target.value)}
                            className="w-full h-full bg-transparent border-none text-slate-300 font-mono text-sm p-5 resize-none focus:ring-0 placeholder:text-slate-600 focus:outline-none disabled:opacity-50"
                            placeholder="2. Paste your repository markdown dump here..."
                            spellCheck={false}
                        />
                        <div className="bg-[#131325] border-t border-[#232348] px-4 py-1 flex justify-between items-center text-[10px] text-slate-500 font-mono select-none">
                            <div>
                                {contextContent.length > 0
                                    ? `${contextContent.split("\n").length} lines • ${contextContent.length.toLocaleString()} chars`
                                    : "Ln 1, Col 1"}
                            </div>
                            <div>UTF-8</div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
