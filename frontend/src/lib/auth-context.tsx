"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { auth as authApi } from "@/lib/api";

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    user_type: string;
    is_admin: boolean;
    image: string;
    status: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: Record<string, unknown>) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthState>({
    user: null,
    token: null,
    loading: true,
    login: async () => { },
    register: async () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("primo_token");
        if (stored) {
            setToken(stored);
            authApi
                .me(stored)
                .then((res) => {
                    setUser(res.data as unknown as User);
                })
                .catch(() => {
                    localStorage.removeItem("primo_token");
                    setToken(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const res = await authApi.login(email, password);
        const { token: t, user: u } = res.data as unknown as { token: string; user: User };
        localStorage.setItem("primo_token", t);
        setToken(t);
        setUser(u);
    }, []);

    const register = useCallback(async (data: Record<string, unknown>) => {
        const res = await authApi.register(data);
        const { token: t, user: u } = res.data as unknown as { token: string; user: User };
        localStorage.setItem("primo_token", t);
        setToken(t);
        setUser(u);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("primo_token");
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
