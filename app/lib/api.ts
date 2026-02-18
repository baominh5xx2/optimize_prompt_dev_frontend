
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

/**
 * Centralized API client with JWT token management.
 */
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    /** Get the stored JWT token. */
    getToken(): string | null {
        if (typeof window === "undefined") return null;
        return localStorage.getItem("access_token");
    }

    /** Store the JWT token. */
    setToken(token: string): void {
        if (typeof window !== "undefined") {
            localStorage.setItem("access_token", token);
        }
    }

    /** Remove the JWT token (logout). */
    clearToken(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
        }
    }

    /** Check if a token exists. */
    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    /** Build headers with optional auth. */
    private getHeaders(withAuth = true): HeadersInit {
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (withAuth) {
            const token = this.getToken();
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
        }
        return headers;
    }

    /** Generic fetch wrapper with error handling. */
    async request<T>(
        endpoint: string,
        options: RequestInit = {},
        withAuth = true
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.getHeaders(withAuth),
                ...(options.headers || {}),
            },
        });

        if (response.status === 401) {
            this.clearToken();
            window.location.href = "/login";
            throw new Error("Unauthorized");
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: "Unknown error" }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // ========== Auth ==========

    async signup(email: string, fullName: string, password: string) {
        return this.request<{ id: number; email: string; full_name: string }>(
            "/auth/signup",
            { method: "POST", body: JSON.stringify({ email, full_name: fullName, password }) },
            false
        );
    }

    async login(email: string, password: string) {
        const data = await this.request<{ access_token: string; token_type: string }>(
            "/auth/login",
            { method: "POST", body: JSON.stringify({ email, password }) },
            false
        );
        this.setToken(data.access_token);
        return data;
    }

    async getMe() {
        return this.request<{
            id: number;
            email: string;
            full_name: string | null;
            avatar_url: string | null;
        }>("/auth/me");
    }

    // ========== Chat Sessions ==========

    async createSession(title?: string) {
        return this.request<{
            id: string;
            title: string;
            status: string;
            created_at: string;
        }>("/chat/sessions", {
            method: "POST",
            body: JSON.stringify({ title: title || "New Optimization" }),
        });
    }

    async listSessions() {
        return this.request<{
            sessions: Array<{
                id: string;
                title: string;
                status: string;
                message_count: number;
                created_at: string;
                updated_at: string;
            }>;
            total: number;
        }>("/chat/sessions");
    }

    async getSession(sessionId: string) {
        return this.request<{
            id: string;
            title: string;
            status: string;
            message_count: number;
        }>(`/chat/sessions/${sessionId}`);
    }

    async getMessages(sessionId: string) {
        return this.request<
            Array<{
                id: string;
                role: string;
                agent_name: string | null;
                content: string;
                metadata_: Record<string, unknown> | null;
                created_at: string;
            }>
        >(`/chat/sessions/${sessionId}/messages`);
    }

    // ========== Knowledge Context ==========

    async getKnowledge(sessionId: string) {
        return this.request<{
            id: string;
            template_instructions: string;
            context_content: string;
        }>(`/chat/sessions/${sessionId}/knowledge`);
    }

    async updateKnowledge(
        sessionId: string,
        data: { template_instructions?: string; context_content?: string }
    ) {
        return this.request<{ id: string }>(
            `/chat/sessions/${sessionId}/knowledge`,
            { method: "PUT", body: JSON.stringify(data) }
        );
    }

    // ========== SSE Streaming ==========

    /**
     * Send a message and return an EventSource-like reader for SSE events.
     * Uses fetch with ReadableStream because EventSource doesn't support POST.
     */
    streamAgentChat(
        sessionId: string,
        message: string,
        knowledgeContext: { template_instructions?: string; context_content?: string } | null,
        onEvent: (event: string, data: unknown) => void,
        onDone: () => void,
        onError: (err: Error) => void
    ): AbortController {
        const controller = new AbortController();
        const url = `${this.baseUrl}/agent/sessions/${sessionId}/messages`;

        const body: Record<string, string | undefined> = { message };
        if (knowledgeContext?.template_instructions) {
            body.template_instructions = knowledgeContext.template_instructions;
        }
        if (knowledgeContext?.context_content) {
            body.context_content = knowledgeContext.context_content;
        }

        fetch(url, {
            method: "POST",
            headers: this.getHeaders(true),
            body: JSON.stringify(body),
            signal: controller.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const reader = response.body?.getReader();
                if (!reader) throw new Error("No response body");

                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    let currentEvent = "message";

                    for (const line of lines) {
                        if (line.startsWith("event:")) {
                            currentEvent = line.slice(6).trim();
                        } else if (line.startsWith("data:")) {
                            const dataStr = line.slice(5).trim();
                            try {
                                const data = JSON.parse(dataStr);
                                onEvent(currentEvent, data);
                            } catch {
                                onEvent(currentEvent, dataStr);
                            }
                        }
                    }
                }
                onDone();
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    onError(err);
                }
            });

        return controller;
    }
}

export const api = new ApiClient(API_BASE_URL);
