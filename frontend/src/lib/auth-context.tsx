"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { auth as authApi } from "@/lib/api";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    organization: string | null;
    status: string;
    is_admin: boolean;
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
                    const u = res as unknown as User;
                    setUser({ ...u, is_admin: u.role === 'SUPERADMIN' || u.role === 'MANAGER' });
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
        const { accessToken, user: u } = res as unknown as { accessToken: string; refreshToken: string; user: User };
        const enriched = { ...u, is_admin: u.role === 'SUPERADMIN' || u.role === 'MANAGER' };
        localStorage.setItem("primo_token", accessToken);
        setToken(accessToken);
        setUser(enriched);
    }, []);

    const register = useCallback(async (data: Record<string, unknown>) => {
        const res = await authApi.register(data);
        const { accessToken, user: u } = res as unknown as { accessToken: string; refreshToken: string; user: User };
        const enriched = { ...u, is_admin: u.role === 'SUPERADMIN' || u.role === 'MANAGER' };
        localStorage.setItem("primo_token", accessToken);
        setToken(accessToken);
        setUser(enriched);
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
