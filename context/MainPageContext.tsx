"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useAuth } from "./AuthContext";


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

export type EditablePhoto = {
    id?: string;
    url: string;
    file?: File;
};

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

    // Ownership
    isPostOwner: (post: Post) => boolean;

    // Edit / Delete
    updatePost: (
        postId: string,
        caption: string,
        photos: EditablePhoto[]
    ) => Promise<boolean>;
    deletePost: (postId: string) => Promise<boolean>;

    // Comments
    addComment: (postId: string, content: string) => Promise<boolean>;
    commentSubmitting: boolean;
}

const MainPageContext = createContext<MainPageContextType | null>(null);

export function MainPageProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, token } = useAuth();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination | null>(null);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedPost = posts.find((p) => p.id === selectedId) || null;

    const [commentSubmitting, setCommentSubmitting] = useState(false);


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


    const selectPost = useCallback((postId: string) => {
        setSelectedId(postId);
    }, []);

    const clearSelectedPost = useCallback(() => {
        setSelectedId(null);
    }, []);


    const isPostOwner = useCallback(
        (post: Post): boolean => {
            if (!user) return false;
            return post.authorId === user.id;
        },
        [user]
    );


    const updatePost = useCallback(
        async (
            postId: string,
            caption: string,
            photos: EditablePhoto[]
        ): Promise<boolean> => {
            if (!token) return false;
            try {
                const newFiles = photos.filter((p) => p.file);
                let newUrls: string[] = [];

                if (newFiles.length > 0) {
                    const formData = new FormData();
                    newFiles.forEach((p) => {
                        if (p.file) formData.append("files", p.file);
                    });

                    const uploadRes = await fetch("/api/post/upload", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: formData,
                    });

                    if (!uploadRes.ok) {
                        const err = await uploadRes.json();
                        throw new Error(err.error || "Upload failed");
                    }

                    const uploadJson = await uploadRes.json();
                    newUrls = uploadJson.data.urls;
                }

                let newUrlIdx = 0;
                const finalPhotos = photos.map((p) => {
                    if (p.file) {
                        return { url: newUrls[newUrlIdx++] };
                    }
                    return { url: p.url };
                });

                const res = await fetch(`/api/post/${postId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        caption,
                        photos: finalPhotos.map((p, idx) => ({
                            url: p.url,
                            order: idx,
                        })),
                    }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Failed to update post");
                }

                const json = await res.json();
                const updatedPost = json.data;

                // Update local state
                setPosts((prev) =>
                    prev.map((p) =>
                        p.id === postId ? { ...p, ...updatedPost } : p
                    )
                );

                return true;
            } catch (err) {
                console.error("Update error:", err);
                throw err instanceof Error ? err : new Error("Couldn't update post.");
            }
        },
        [token]
    );

    // ── Delete post ─────────────────────────────────────────────

    const deletePost = useCallback(
        async (postId: string): Promise<boolean> => {
            if (!token) return false;
            try {
                const res = await fetch(`/api/post/${postId}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Failed to delete post");
                }

                setPosts((prev) => prev.filter((p) => p.id !== postId));

                setSelectedId((prev) => (prev === postId ? null : prev));

                return true;
            } catch (err) {
                throw err instanceof Error ? err : new Error("Couldn't delete post.");
            }
        },
        [token]
    );


    const addComment = useCallback(
        async (postId: string, content: string): Promise<boolean> => {
            if (!content.trim() || !user || !token) return false;

            setCommentSubmitting(true);
            try {
                const res = await fetch(`/api/post/${postId}/comment`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        content: content.trim(),
                    }),
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || "Failed to add comment");
                }

                const json = await res.json();
                const newComment = json.data;

                setPosts((prev) =>
                    prev.map((post) =>
                        post.id === postId
                            ? {
                                ...post,
                                comments: [newComment, ...post.comments],
                                _count: {
                                    ...post._count,
                                    comments: post._count.comments + 1,
                                },
                            }
                            : post
                    )
                );

                return true;
            } catch (err) {
                throw err instanceof Error ? err : new Error("Couldn't post comment.");
            } finally {
                setCommentSubmitting(false);
            }
        },
        [user, token]
    );

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
                isPostOwner,
                updatePost,
                deletePost,
                addComment,
                commentSubmitting,
            }}
        >
            {children}
        </MainPageContext.Provider>
    );
}

export function useMainPage() {
    const context = useContext(MainPageContext);
    if (!context) {
        throw new Error("useMainPage must be used within a MainPageProvider");
    }
    return context;
}
