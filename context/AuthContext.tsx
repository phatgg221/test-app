"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export interface User {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    loginWithGoogle: (credential: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_TOKEN_KEY = "snapshare_token";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";


function decodeJwtPayload(token: string): User | null {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        const payload = JSON.parse(jsonPayload);

        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return null;
        }
        return {
            id: payload.id,
            email: payload.email,
            name: payload.name,
            avatar: payload.avatar,
        };
    } catch {
        return null;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            // Migration: Clean up old user key if it exists
            localStorage.removeItem("snapshare_user");

            const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
            if (storedToken) {
                const decodedUser = decodeJwtPayload(storedToken);
                if (decodedUser) {
                    setUser(decodedUser);
                    setToken(storedToken);
                } else {
                    localStorage.removeItem(AUTH_TOKEN_KEY);
                }
            }
        } catch {
            localStorage.removeItem(AUTH_TOKEN_KEY);
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
            const accessToken: string = json.token;

            // Derive user from JWT for consistent single source of truth
            const decodedUser = decodeJwtPayload(accessToken);
            if (!decodedUser) throw new Error("Invalid token received");

            setUser(decodedUser);
            setToken(accessToken);

            localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        } finally {
            setLoading(false);
        }
    }, []);

    // Logout
    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
    }, []);

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthContext.Provider
                value={{
                    user,
                    token,
                    loading,
                    loginWithGoogle,
                    logout,
                    isAuthenticated: !!user && !!token,
                }}
            >
                {children}
            </AuthContext.Provider>
        </GoogleOAuthProvider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
