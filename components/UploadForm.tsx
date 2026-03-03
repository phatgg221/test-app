"use client";

import { useState } from "react";
import {
    Upload,
    Button,
    Input,
    Modal,
    Typography,
    Space,
    Avatar,
    Divider,
    Tooltip,
    message,
} from "antd";
import {
    PictureOutlined,
    PlusOutlined,
    CloseOutlined,
    UserOutlined,
    SendOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import { useAuth } from "@/context/AuthContext";

const { TextArea } = Input;
const { Text, Title } = Typography;

interface UploadFormProps {
    onUploadSuccess: () => void;
}

const UploadForm = ({ onUploadSuccess }: UploadFormProps) => {
    const { user, isAuthenticated } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [caption, setCaption] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showUploadArea, setShowUploadArea] = useState(false);

    const openModal = () => {
        if (!isAuthenticated) {
            message.info("Please log in to create a post.");
            return;
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (submitting) return;
        setIsModalOpen(false);
        setFileList([]);
        setCaption("");
        setShowUploadArea(false);
    };

    const handleSubmit = async () => {
        if (fileList.length === 0 && !caption.trim()) {
            message.warning("Add a photo or write something.");
            return;
        }

        if (!user) {
            message.error("Please log in first.");
            return;
        }

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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    authorId: user.id,
                    caption: caption.trim() || undefined,
                    photos: photoUrls.map((url, idx) => ({ url, order: idx })),
                }),
            });

            if (!postRes.ok) {
                const err = await postRes.json();
                throw new Error(err.error || "Failed to create post");
            }

            message.success("Post created!");
            closeModal();
            onUploadSuccess();
        } catch (err) {
            message.error(
                err instanceof Error ? err.message : "Something went wrong"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const canPost = caption.trim().length > 0 || fileList.length > 0;

    return (
        <>
            {/* ── Compact trigger bar ── */}
            <div
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "16px 20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    border: "1px solid #f0f0f0",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <Avatar
                        size={44}
                        src={user?.avatar}
                        icon={<UserOutlined />}
                        style={{
                            background: isAuthenticated
                                ? "#1677ff"
                                : "#d9d9d9",
                            flexShrink: 0,
                        }}
                    />

                    <div
                        onClick={openModal}
                        style={{
                            flex: 1,
                            background: "#f0f2f5",
                            borderRadius: 24,
                            padding: "10px 16px",
                            cursor: "pointer",
                            transition: "background 0.2s",
                            fontSize: 15,
                            color: "#65676b",
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#e4e6e9")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#f0f2f5")
                        }
                    >
                        {isAuthenticated
                            ? `What's on your mind, ${user?.name || "User"}?`
                            : "Log in to share something..."}
                    </div>
                </div>

                <Divider style={{ margin: "12px 0 8px" }} />

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <Tooltip title="Photo">
                        <Button
                            type="text"
                            icon={
                                <PictureOutlined
                                    style={{ color: "#45bd62", fontSize: 20 }}
                                />
                            }
                            onClick={() => {
                                if (!isAuthenticated) {
                                    message.info(
                                        "Please log in to create a post."
                                    );
                                    return;
                                }
                                setShowUploadArea(true);
                                openModal();
                            }}
                            style={{
                                fontWeight: 600,
                                color: "#65676b",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            Photo
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {/* ── Create Post Modal ── */}
            <Modal
                open={isModalOpen}
                onCancel={closeModal}
                centered
                width={520}
                footer={null}
                closeIcon={
                    <CloseOutlined
                        style={{
                            fontSize: 16,
                            background: "#e4e6e9",
                            borderRadius: "50%",
                            padding: 8,
                        }}
                    />
                }
                title={
                    <div style={{ textAlign: "center", paddingBottom: 4 }}>
                        <Title level={4} style={{ margin: 0 }}>
                            Create post
                        </Title>
                    </div>
                }
                styles={{
                    body: { padding: "0 16px 16px" },
                    header: {
                        borderBottom: "1px solid #e4e6e9",
                        padding: "16px 16px 12px",
                    },
                }}
            >
                {/* Author row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "16px 0 8px",
                    }}
                >
                    <Avatar
                        size={40}
                        src={user?.avatar}
                        icon={<UserOutlined />}
                        style={{ background: "#1677ff" }}
                    />
                    <div>
                        <Text strong style={{ fontSize: 15 }}>
                            {user?.name || "User"}
                        </Text>
                        <br />
                        <Text
                            type="secondary"
                            style={{
                                fontSize: 12,
                                background: "#e4e6e9",
                                padding: "1px 8px",
                                borderRadius: 4,
                            }}
                        >
                            🌐 Public
                        </Text>
                    </div>
                </div>

                {/* Caption textarea */}
                <TextArea
                    autoFocus
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder={`What's on your mind, ${user?.name || "User"}?`}
                    autoSize={{ minRows: 3, maxRows: 8 }}
                    maxLength={2000}
                    variant="borderless"
                    style={{
                        fontSize: 16,
                        padding: "8px 0",
                        resize: "none",
                    }}
                />

                {/* Upload area */}
                {showUploadArea && (
                    <div
                        style={{
                            border: "1px solid #e4e6e9",
                            borderRadius: 8,
                            padding: 8,
                            marginTop: 8,
                            position: "relative",
                        }}
                    >
                        {!fileList.length && (
                            <Button
                                type="text"
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={() => {
                                    setShowUploadArea(false);
                                    setFileList([]);
                                }}
                                style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    zIndex: 2,
                                    background: "#fff",
                                    borderRadius: "50%",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                                }}
                            />
                        )}

                        <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={({ fileList: newFileList }) =>
                                setFileList(newFileList)
                            }
                            beforeUpload={() => false}
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            maxCount={10}
                        >
                            {fileList.length < 10 && (
                                <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8, fontSize: 12 }}>
                                        Add photos
                                    </div>
                                </div>
                            )}
                        </Upload>
                    </div>
                )}

                {/* "Add to your post" bar */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        border: "1px solid #e4e6e9",
                        borderRadius: 8,
                        padding: "8px 12px",
                        marginTop: 16,
                    }}
                >
                    <Text strong style={{ fontSize: 14 }}>
                        Add to your post
                    </Text>
                    <Space size={4}>
                        <Tooltip title="Photo">
                            <Button
                                type="text"
                                shape="circle"
                                icon={
                                    <PictureOutlined
                                        style={{
                                            color: "#45bd62",
                                            fontSize: 22,
                                        }}
                                    />
                                }
                                onClick={() => setShowUploadArea(true)}
                            />
                        </Tooltip>
                    </Space>
                </div>

                {/* Post button */}
                <Button
                    type="primary"
                    block
                    size="large"
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={!canPost}
                    style={{
                        marginTop: 16,
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: 15,
                        height: 44,
                    }}
                    icon={<SendOutlined />}
                >
                    Post
                </Button>
            </Modal>
        </>
    );
};

export default UploadForm;
