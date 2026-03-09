"use client";

import React from "react";
import {
    Button,
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
import { useAuth } from "@/context/AuthContext";
import { useCreatePost } from "@/context/CreatePostContext";
import EditableTextArea from "@/components/EditableTextArea";

const { Text, Title } = Typography;

const UploadForm = () => {
    const { user, isAuthenticated } = useAuth();
    const {
        isModalOpen,
        openModal,
        closeModal,
        caption,
        setCaption,
        fileList,
        addFiles,
        removeFile,
        showUploadArea,
        setShowUploadArea,
        submitting,
        canPost,
        submitPost,
    } = useCreatePost();

    const handleOpenModal = () => {
        if (!openModal()) {
            message.info("Please log in to create a post.");
        }
    };

    const handleOpenWithPhotos = () => {
        if (!isAuthenticated) {
            message.info("Please log in to create a post.");
            return;
        }
        setShowUploadArea(true);
        openModal();
    };

    const handleSubmit = async () => {
        try {
            const success = await submitPost();
            if (success) {
                message.success("Post created!");
            }
        } catch (err) {
            message.error(
                err instanceof Error ? err.message : "Something went wrong"
            );
        }
    };

    const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        addFiles(Array.from(files));
        e.target.value = "";
    };

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
                        onClick={handleOpenModal}
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

                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Tooltip title="Photo">
                        <Button
                            type="text"
                            icon={
                                <PictureOutlined
                                    style={{ color: "#45bd62", fontSize: 20 }}
                                />
                            }
                            onClick={handleOpenWithPhotos}
                            style={{
                                width: "100%",
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
                    </div>
                </div>

                <EditableTextArea
                    value={caption}
                    onChange={setCaption}
                    placeholder={`What's on your mind, ${user?.name || "User"}?`}
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
                        <Button
                            type="text"
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => {
                                setShowUploadArea(false);
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

                        <input
                            type="file"
                            id="photo-upload-input"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            style={{ display: "none" }}
                            onChange={handleFilesSelected}
                        />

                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                overflowX: "auto",
                                overflowY: "hidden",
                                padding: "4px 0",
                                scrollbarWidth: "thin",
                            }}
                        >
                            {fileList.map((file, idx) => (
                                <div
                                    key={file.uid}
                                    style={{
                                        position: "relative",
                                        flexShrink: 0,
                                        width: 100,
                                        height: 100,
                                        borderRadius: 8,
                                        overflow: "hidden",
                                        border: "1px solid #e4e6e9",
                                    }}
                                >
                                    <img
                                        src={
                                            file.url ||
                                            (file.originFileObj
                                                ? URL.createObjectURL(
                                                    file.originFileObj as File
                                                )
                                                : "")
                                        }
                                        alt={file.name}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={
                                            <CloseOutlined
                                                style={{ fontSize: 10 }}
                                            />
                                        }
                                        onClick={() => removeFile(idx)}
                                        style={{
                                            position: "absolute",
                                            top: 4,
                                            right: 4,
                                            width: 20,
                                            height: 20,
                                            minWidth: 20,
                                            padding: 0,
                                            background: "rgba(0,0,0,0.5)",
                                            color: "#fff",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    />
                                </div>
                            ))}

                            {fileList.length < 10 && (
                                <div
                                    onClick={() =>
                                        document
                                            .getElementById(
                                                "photo-upload-input"
                                            )
                                            ?.click()
                                    }
                                    style={{
                                        flexShrink: 0,
                                        width: 100,
                                        height: 100,
                                        borderRadius: 8,
                                        border: "2px dashed #d9d9d9",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        transition: "border-color 0.2s",
                                        color: "#8c8c8c",
                                        gap: 4,
                                    }}
                                    onMouseEnter={(e) =>
                                    (e.currentTarget.style.borderColor =
                                        "#1677ff")
                                    }
                                    onMouseLeave={(e) =>
                                    (e.currentTarget.style.borderColor =
                                        "#d9d9d9")
                                    }
                                >
                                    <PlusOutlined style={{ fontSize: 20 }} />
                                    <span style={{ fontSize: 11 }}>Add</span>
                                </div>
                            )}
                        </div>
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
