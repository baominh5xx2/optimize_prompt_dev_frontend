
import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
    const { signup } = useAuth();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await signup(email, fullName, password);
            window.location.href = "/";
        } catch (err: any) {
            setError(err.message || "Sign up failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-4 font-display">
            {/* Background decor */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="size-10 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl">auto_awesome</span>
                        </div>
                        <h1 className="text-white text-2xl font-bold tracking-tight">PromptOpt</h1>
                    </div>
                    <p className="text-[#9292c9] text-sm">Create your account and start optimizing</p>
                </div>

                {/* Card */}
                <div className="bg-[#15152a] rounded-2xl border border-[#323267] p-8 shadow-2xl neon-glow">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-[#9292c9] mb-1.5">Full Name</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-[#111122] border border-[#232348] rounded-lg px-4 py-3 text-white placeholder:text-[#565685] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#9292c9] mb-1.5">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#111122] border border-[#232348] rounded-lg px-4 py-3 text-white placeholder:text-[#565685] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="dev@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#9292c9] mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#111122] border border-[#232348] rounded-lg px-4 py-3 text-white placeholder:text-[#565685] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#9292c9] mb-1.5">Confirm Password</label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-[#111122] border border-[#232348] rounded-lg px-4 py-3 text-white placeholder:text-[#565685] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all shadow-lg shadow-primary/25 cursor-pointer"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                                    Creating account...
                                </span>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-[#565685] text-sm">
                            Already have an account?{" "}
                            <a href="/login" className="text-primary hover:text-blue-400 font-medium transition-colors">
                                Sign in
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
