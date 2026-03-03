"use client";

import {
    createContext,
    useCallback,
    useContext,
    useState,
} from "react";
import type { UploadFile } from "antd";
import { useAuth } from "./AuthContext";


interface CreatePostContextType {
    // Modal state
    isModalOpen: boolean;
    openModal: () => boolean; // returns false if not authenticated
    closeModal: () => void;

    // Form state
    caption: string;
    setCaption: (value: string) => void;
    fileList: UploadFile[];
    setFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>;
    addFiles: (files: File[]) => void;
    removeFile: (index: number) => void;
    showUploadArea: boolean;
    setShowUploadArea: (show: boolean) => void;

    // Submit
    submitting: boolean;
    canPost: boolean;
    submitPost: () => Promise<boolean>; // returns true on success
}


const CreatePostContext = createContext<CreatePostContextType | null>(null);


export function CreatePostProvider({
    children,
    onPostCreated,
}: {
    children: React.ReactNode;
    onPostCreated?: () => void;
}) {
    const { user, token, isAuthenticated } = useAuth();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [caption, setCaption] = useState("");
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [showUploadArea, setShowUploadArea] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const canPost = caption.trim().length > 0 || fileList.length > 0;


    const openModal = useCallback((): boolean => {
        if (!isAuthenticated) return false;
        setIsModalOpen(true);
        return true;
    }, [isAuthenticated]);

    const closeModal = useCallback(() => {
        if (submitting) return;
        setIsModalOpen(false);
        setFileList([]);
        setCaption("");
        setShowUploadArea(false);
    }, [submitting]);

    const addFiles = useCallback((files: File[]) => {
        const newFiles: UploadFile[] = files.map((file, idx) => ({
            uid: `${Date.now()}-${idx}`,
            name: file.name,
            status: "done" as const,
            originFileObj: file as UploadFile["originFileObj"],
            url: URL.createObjectURL(file),
        }));
        setFileList((prev) => [...prev, ...newFiles].slice(0, 10));
    }, []);

    const removeFile = useCallback((index: number) => {
        setFileList((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const submitPost = useCallback(async (): Promise<boolean> => {
        if (!canPost || !user || !token) return false;

        setSubmitting(true);

        try {
            let photoUrls: string[] = [];

            // Step 1: Upload files to S3 if any
            if (fileList.length > 0) {
                const formData = new FormData();
                fileList.forEach((file) => {
                    if (file.originFileObj) {
                        formData.append("files", file.originFileObj);
                    }
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
                photoUrls = uploadJson.data.urls;
            }

            // Step 2: Create post
            const postRes = await fetch("/api/post", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    caption: caption.trim() || undefined,
                    photos: photoUrls.map((url, idx) => ({ url, order: idx })),
                }),
            });

            if (!postRes.ok) {
                const err = await postRes.json();
                throw new Error(err.error || "Failed to create post");
            }

            // Reset form
            setIsModalOpen(false);
            setFileList([]);
            setCaption("");
            setShowUploadArea(false);

            // Notify parent
            onPostCreated?.();

            return true;
        } catch (err) {
            throw err; // Let the UI handle the error message
        } finally {
            setSubmitting(false);
        }
    }, [canPost, user, token, fileList, caption, onPostCreated]);

    return (
        <CreatePostContext.Provider
            value={{
                isModalOpen,
                openModal,
                closeModal,
                caption,
                setCaption,
                fileList,
                setFileList,
                addFiles,
                removeFile,
                showUploadArea,
                setShowUploadArea,
                submitting,
                canPost,
                submitPost,
            }}
        >
            {children}
        </CreatePostContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────

export function useCreatePost() {
    const context = useContext(CreatePostContext);
    if (!context) {
        throw new Error(
            "useCreatePost must be used within a CreatePostProvider"
        );
    }
    return context;
}
