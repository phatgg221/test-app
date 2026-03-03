"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useAuth } from "./AuthContext";

// ─── Types ───────────────────────────────────────────────────────

interface Author {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
}

interface Photo {
    id: string;
    url: string;
    order: number;
    createdAt: string;
    postId: string;
}

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    authorId: string;
    postId: string;
    author: {
        id: string;
        name: string | null;
        avatar: string | null;
    };
}

export interface Post {
    id: string;
    caption: string | null;
    createdAt: string;
    updatedAt: string;
    authorId: string;
    author: Author;
    photos: Photo[];
    comments: Comment[];
    _count: { comments: number };
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface MainPageContextType {
    // Posts
    posts: Post[];
    loading: boolean;
    error: string | null;
    pagination: Pagination | null;
    fetchPosts: (page?: number) => Promise<void>;
    loadMore: () => Promise<void>;
    refreshPosts: () => Promise<void>;
    hasMore: boolean;

    // Selected post overlay
    selectedPost: Post | null;
    selectPost: (postId: string) => void;
    clearSelectedPost: () => void;

    // Comments
    addComment: (postId: string, content: string) => Promise<boolean>;
    commentSubmitting: boolean;
}

// ─── Context ─────────────────────────────────────────────────────

const MainPageContext = createContext<MainPageContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────────

export function MainPageProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination | null>(null);

    // Selected post overlay
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedPost = posts.find((p) => p.id === selectedId) || null;

    // Comment
    const [commentSubmitting, setCommentSubmitting] = useState(false);

    // ── Fetch posts ──────────────────────────────────────────────

    const fetchPosts = useCallback(async (page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch(`/api/post?page=${page}&limit=10`);

            if (!res.ok) {
                throw new Error("Failed to fetch posts");
            }

            const json = await res.json();

            if (page === 1) {
                setPosts(json.data);
            } else {
                setPosts((prev) => [...prev, ...json.data]);
            }

            setPagination(json.pagination);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMore = useCallback(async () => {
        if (!pagination || pagination.page >= pagination.totalPages) return;
        await fetchPosts(pagination.page + 1);
    }, [pagination, fetchPosts]);

    const refreshPosts = useCallback(async () => {
        setPosts([]);
        await fetchPosts(1);
    }, [fetchPosts]);

    const hasMore = pagination
        ? pagination.page < pagination.totalPages
        : false;

    // ── Selected post ────────────────────────────────────────────

    const selectPost = useCallback((postId: string) => {
        setSelectedId(postId);
    }, []);

    const clearSelectedPost = useCallback(() => {
        setSelectedId(null);
    }, []);

    // ── Add comment ──────────────────────────────────────────────

    const addComment = useCallback(
        async (postId: string, content: string): Promise<boolean> => {
            if (!content.trim() || !user) return false;

            setCommentSubmitting(true);
            try {
                const res = await fetch(`/api/post/${postId}/comment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        content: content.trim(),
                        authorId: user.id,
                    }),
                });

                if (!res.ok) {
                    throw new Error("Failed to add comment");
                }

                // Refresh posts to get the new comment
                await refreshPosts();
                return true;
            } catch {
                throw new Error("Couldn't post comment.");
            } finally {
                setCommentSubmitting(false);
            }
        },
        [user, refreshPosts]
    );

    // ── Initial fetch ────────────────────────────────────────────

    useEffect(() => {
        fetchPosts(1);
    }, [fetchPosts]);

    return (
        <MainPageContext.Provider
            value={{
                posts,
                loading,
                error,
                pagination,
                fetchPosts,
                loadMore,
                refreshPosts,
                hasMore,
                selectedPost,
                selectPost,
                clearSelectedPost,
                addComment,
                commentSubmitting,
            }}
        >
            {children}
        </MainPageContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────

export function useMainPage() {
    const context = useContext(MainPageContext);
    if (!context) {
        throw new Error("useMainPage must be used within a MainPageProvider");
    }
    return context;
}
