
import { useState } from "react";

interface PromptRankCardProps {
    rank: number;
    title: string;
    content: string;
    icon?: string;
}

export function PromptRankCard({ rank, title, content, icon }: PromptRankCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getRankColor = (r: number) => {
        switch (r) {
            case 1: return "from-yellow-500/20 to-amber-500/5 border-yellow-500/50 text-yellow-500";
            case 2: return "from-slate-400/20 to-slate-500/5 border-slate-400/50 text-slate-300";
            case 3: return "from-orange-700/20 to-orange-800/5 border-orange-700/50 text-orange-400";
            default: return "from-blue-500/20 to-blue-600/5 border-blue-500/50 text-blue-400";
        }
    };

    const getBadgeColor = (r: number) => {
        switch (r) {
            case 1: return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            case 2: return "bg-slate-500/20 text-slate-300 border-slate-500/30";
            case 3: return "bg-orange-700/20 text-orange-400 border-orange-700/30";
            default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        }
    };

    return (
        <div className={`relative rounded-xl border overflow-hidden ${getRankColor(rank)} bg-gradient-to-br mb-4 last:mb-0 transition-all hover:shadow-lg hover:shadow-black/20 group`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-inherit bg-black/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center size-8 rounded-lg border ${getBadgeColor(rank)} shadow-inner`}>
                        <span className="text-lg">{icon}</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getBadgeColor(rank)}`}>
                                Rank {rank}
                            </span>
                        </div>
                        <h4 className="text-sm font-medium text-slate-200 mt-0.5 line-clamp-1" title={title}>
                            {title}
                        </h4>
                    </div>
                </div>
                <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="Copy prompt"
                >
                    <span className="material-symbols-outlined text-lg">
                        {copied ? "check" : "content_copy"}
                    </span>
                </button>
            </div>

            {/* Content */}
            <div className="p-4 bg-[#0c0c16]/50">
                <div className="relative">
                    <pre className="text-xs sm:text-sm font-mono text-slate-300 whitespace-pre-wrap break-words leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar p-2 rounded-lg hover:bg-black/20 transition-colors">
                        {content}
                    </pre>
                    {/* Fade out effect at bottom if content is long? omitted for now to keep simple */}
                </div>
            </div>
        </div>
    );
}
