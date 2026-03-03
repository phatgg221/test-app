"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

// ─── Types ───────────────────────────────────────────────────────

export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithGoogle: (credential: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

// ─── Context ─────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = "snapshare_user";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

// ─── Provider ────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(AUTH_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as User;
                setUser(parsed);
            }
        } catch {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        } finally {
            setLoading(false);
        }
    }, []);

    // Google OAuth login
    const loginWithGoogle = useCallback(async (credential: string) => {
        setLoading(true);
        try {
            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Google login failed");
            }

            const json = await res.json();
            const loggedInUser: User = json.data;
            setUser(loggedInUser);
            localStorage.setItem(
                AUTH_STORAGE_KEY,
                JSON.stringify(loggedInUser)
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Logout
    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }, []);

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthContext.Provider
                value={{
                    user,
                    loading,
                    loginWithGoogle,
                    logout,
                    isAuthenticated: !!user,
                }}
            >
                {children}
            </AuthContext.Provider>
        </GoogleOAuthProvider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
