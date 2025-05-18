"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {apiFetch} from "@/config/api";

interface AuthInfo {
    username: string;
    roles: string[];
}

const AuthContext = createContext<AuthInfo | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<AuthInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthInfo = async () => {
            try {
                const userInfo = await apiFetch<AuthInfo>("/auth/me", {
                    requiresAuth: true,
                });
                setAuth(userInfo);
            } catch (err) {
                console.error("Authentication error:", err);
                localStorage.removeItem("jwt");
                window.location.href = "/login";
            } finally {
                setLoading(false);
            }
        };

        fetchAuthInfo();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}