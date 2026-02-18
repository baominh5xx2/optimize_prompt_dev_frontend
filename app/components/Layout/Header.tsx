
import { useAuth } from "../../context/AuthContext";

export function Header() {
    const { user, isAuthenticated, logout } = useAuth();

    const displayName = user?.full_name || user?.email || "User";
    const avatarUrl = user?.avatar_url
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;

    return (
        <header className="h-16 border-b border-slate-200 dark:border-[#232348] bg-white dark:bg-[#111122] flex items-center justify-between px-6 shrink-0 z-20">
            <div className="flex items-center gap-4">
                <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg">
                    <span className="material-symbols-outlined text-2xl">terminal</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight">
                    DevPrompt Optimizer
                </h1>
                <div className="h-6 w-px bg-slate-300 dark:bg-[#232348] mx-2"></div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#232348] cursor-pointer hover:bg-slate-200 dark:hover:bg-[#2f2f5e] transition-colors group">
                    <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400">
                        folder_open
                    </span>
                    <span className="text-sm font-medium">
                        Prompt Optimization
                    </span>
                    <span className="material-symbols-outlined text-sm text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors">
                        expand_more
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button className="flex items-center justify-center size-9 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232348] transition-colors text-slate-500 dark:text-slate-400 cursor-pointer">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <button className="flex items-center justify-center size-9 rounded-lg hover:bg-slate-100 dark:hover:bg-[#232348] transition-colors text-slate-500 dark:text-slate-400 cursor-pointer">
                    <span className="material-symbols-outlined">settings</span>
                </button>
                {isAuthenticated ? (
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 p-[2px]">
                            <div className="size-full rounded-full bg-slate-900 overflow-hidden">
                                <img
                                    alt={displayName}
                                    className="size-full object-cover"
                                    src={avatarUrl}
                                />
                            </div>
                        </div>
                        <span className="text-sm text-slate-300 font-medium hidden md:inline">
                            {displayName}
                        </span>
                        <button
                            onClick={logout}
                            className="text-xs text-slate-500 hover:text-red-400 transition-colors cursor-pointer ml-1"
                            title="Sign out"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                        </button>
                    </div>
                ) : (
                    <a
                        href="/login"
                        className="text-sm text-primary hover:text-blue-400 font-medium transition-colors"
                    >
                        Sign In
                    </a>
                )}
            </div>
        </header>
    );
}
