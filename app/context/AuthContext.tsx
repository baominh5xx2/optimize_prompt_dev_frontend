
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "../lib/api";

interface UserInfo {
    id: number;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
}

interface AuthContextType {
    user: UserInfo | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, fullName: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize token on mount (client-side only)
    useEffect(() => {
        setToken(api.getToken());
    }, []);

    const fetchUser = useCallback(async () => {
        if (!api.isAuthenticated()) {
            setIsLoading(false);
            return;
        }
        try {
            const me = await api.getMe();
            setUser(me);
            setToken(api.getToken());
        } catch {
            api.clearToken();
            setUser(null);
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = async (email: string, password: string) => {
        await api.login(email, password);
        setToken(api.getToken());
        const me = await api.getMe();
        setUser(me);
    };

    const signup = async (email: string, fullName: string, password: string) => {
        await api.signup(email, fullName, password);
        // Auto-login after signup
        await api.login(email, password);
        setToken(api.getToken());
        const me = await api.getMe();
        setUser(me);
    };

    const logout = () => {
        api.clearToken();
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                signup,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
