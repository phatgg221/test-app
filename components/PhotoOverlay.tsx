"use client";

import { useEffect, useState } from "react";
import {
    Modal,
    Image,
    Typography,
    Space,
    Input,
    Button,
    List,
    Avatar,
    Carousel,
    message,
    Divider,
    Popconfirm,
    Dropdown,
    Tooltip,
} from "antd";
import {
    CloseOutlined,
    SendOutlined,
    UserOutlined,
    PictureOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckOutlined,
    CloseCircleOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { type Post, type EditablePhoto } from "@/context/MainPageContext";
import { useMainPage } from "@/context/MainPageContext";
import { formatDistanceToNow } from "date-fns";

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

interface PhotoOverlayProps {
    post: Post;
    onClose: () => void;
}

const PhotoOverlay = ({ post, onClose }: PhotoOverlayProps) => {
    const {
        addComment,
        commentSubmitting,
        isPostOwner,
        updatePost,
        deletePost,
    } = useMainPage();

    const [commentText, setCommentText] = useState("");

    // Edit mode
    const isOwner = isPostOwner(post);
    const [editing, setEditing] = useState(false);
    const [editCaption, setEditCaption] = useState(post.caption || "");
    const [editPhotos, setEditPhotos] = useState<EditablePhoto[]>([]);
    const [saving, setSaving] = useState(false);

    // Sync edit state when post changes or entering edit mode
    useEffect(() => {
        if (editing) {
            setEditCaption(post.caption || "");
            setEditPhotos(post.photos.map(p => ({ id: p.id, url: p.url })));
        }
    }, [editing, post]);

    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        try {
            const success = await addComment(post.id, commentText.trim());
            if (success) {
                setCommentText("");
                message.success("Comment added!");
            }
        } catch {
            message.error("Couldn't post comment.");
        }
    };

    const handleSavePost = async () => {
        if (editPhotos.length === 0 && !editCaption.trim()) {
            message.warning("Post cannot be empty.");
            return;
        }

        setSaving(true);
        try {
            await updatePost(post.id, editCaption.trim(), editPhotos);
            setEditing(false);
            message.success("Post updated!");
        } catch (err) {
            message.error(err instanceof Error ? err.message : "Couldn't update post.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deletePost(post.id);
            message.success("Post deleted.");
        } catch {
            message.error("Couldn't delete post.");
        }
    };

    const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPhotos: EditablePhoto[] = Array.from(files).map(file => ({
            url: URL.createObjectURL(file),
            file: file
        }));

        setEditPhotos(prev => [...prev, ...newPhotos].slice(0, 10));
        e.target.value = "";
    };

    const removePhoto = (index: number) => {
        setEditPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const ownerMenuItems = [
        {
            key: "edit",
            label: "Edit post",
            icon: <EditOutlined />,
            onClick: () => setEditing(true),
        },
        {
            key: "delete",
            label: (
                <Popconfirm
                    title="Delete this post?"
                    description="This action cannot be undone."
                    onConfirm={handleDelete}
                    okText="Delete"
                    okType="danger"
                    cancelText="Cancel"
                >
                    <span style={{ color: "#ff4d4f" }}>Delete post</span>
                </Popconfirm>
            ),
            icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
        },
    ];

    return (
        <Modal
            open
            onCancel={onClose}
            footer={null}
            width={720}
            closeIcon={<CloseOutlined />}
            centered
            styles={{
                body: { padding: 0 },
            }}
        >
            {/* Photo Section — Read-only Carousel or Edit Grid */}
            {!editing ? (
                /* ── Read-only Carousel ── */
                post.photos.length > 0 ? (
                    <div style={{ background: "#000", borderRadius: "8px 8px 0 0" }}>
                        {post.photos.length === 1 ? (
                            <div style={{ display: "flex", justifyContent: "center", maxHeight: 480 }}>
                                <Image
                                    src={post.photos[0].url}
                                    alt={post.caption || "Post photo"}
                                    style={{ maxHeight: 480, objectFit: "contain", width: "100%" }}
                                />
                            </div>
                        ) : (
                            <Carousel dots arrows style={{ maxHeight: 480 }}>
                                {post.photos.map((photo) => (
                                    <div key={photo.id}>
                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 480, background: "#000" }}>
                                            <Image
                                                src={photo.url}
                                                alt={post.caption || "Post photo"}
                                                style={{ maxHeight: 480, objectFit: "contain" }}
                                                preview={false}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </Carousel>
                        )}
                    </div>
                ) : (
                    <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", borderRadius: "8px 8px 0 0" }}>
                        <Space direction="vertical" align="center">
                            <PictureOutlined style={{ fontSize: 40, color: "#d9d9d9" }} />
                            <Text type="secondary">No photos</Text>
                        </Space>
                    </div>
                )
            ) : (
                /* ── Edit Grid ── */
                <div style={{ padding: "24px 24px 0", background: "#f5f5f5", borderRadius: "8px 8px 0 0" }}>
                    <div style={{ border: "1px dashed #d9d9d9", borderRadius: 8, padding: 12, background: "#fff", position: "relative" }}>
                        <input
                            type="file"
                            id="edit-photo-upload"
                            accept="image/*"
                            multiple
                            style={{ display: "none" }}
                            onChange={handleFilesSelected}
                        />

                        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "thin" }}>
                            {editPhotos.map((photo, idx) => (
                                <div key={idx} style={{ position: "relative", flexShrink: 0, width: 120, height: 120, borderRadius: 8, overflow: "hidden", border: "1px solid #e8e8e8" }}>
                                    <img src={photo.url} alt="Post" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<CloseOutlined style={{ fontSize: 10 }} />}
                                        onClick={() => removePhoto(idx)}
                                        style={{
                                            position: "absolute",
                                            top: 4, right: 4, width: 22, height: 22, minWidth: 22,
                                            background: "rgba(0,0,0,0.5)", color: "#fff", borderRadius: "50%",
                                            display: "flex", alignItems: "center", justifyContent: "center"
                                        }}
                                    />
                                </div>
                            ))}

                            {editPhotos.length < 10 && (
                                <div
                                    onClick={() => document.getElementById("edit-photo-upload")?.click()}
                                    style={{
                                        flexShrink: 0, width: 120, height: 120, borderRadius: 8, border: "2px dashed #d9d9d9",
                                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                        cursor: "pointer", color: "#8c8c8c", gap: 4
                                    }}
                                >
                                    <PlusOutlined style={{ fontSize: 24 }} />
                                    <span style={{ fontSize: 13 }}>Add Photo</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Post info */}
            <div style={{ padding: "20px 24px" }}>
                {/* Author + timestamp + actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <Space align="center" size={12}>
                        <Avatar
                            size={36}
                            src={post.author.avatar}
                            icon={!post.author.avatar && <UserOutlined />}
                        />
                        <div>
                            <Text strong>{post.author.name || "Anonymous"}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </Text>
                        </div>
                    </Space>

                    {isOwner && !editing && (
                        <Dropdown menu={{ items: ownerMenuItems }} trigger={["click"]} placement="bottomRight">
                            <Button
                                type="text"
                                shape="circle"
                                icon={<MoreOutlined style={{ fontSize: 20 }} />}
                                style={{ color: "#65676b" }}
                            />
                        </Dropdown>
                    )}
                </div>

                {/* Caption — editable or read-only */}
                {editing ? (
                    <div style={{ marginBottom: 16 }}>
                        <TextArea
                            autoFocus
                            value={editCaption}
                            onChange={(e) => setEditCaption(e.target.value)}
                            autoSize={{ minRows: 2, maxRows: 6 }}
                            maxLength={2000}
                            style={{ marginBottom: 12, fontSize: 15 }}
                            placeholder="Add a caption..."
                        />
                        <Space size="middle">
                            <Button
                                type="primary"
                                onClick={handleSavePost}
                                loading={saving}
                                icon={<CheckOutlined />}
                                style={{ borderRadius: 6, fontWeight: 600 }}
                            >
                                Save Changes
                            </Button>
                            <Button
                                onClick={() => setEditing(false)}
                                disabled={saving}
                                icon={<CloseCircleOutlined />}
                                style={{ borderRadius: 6 }}
                            >
                                Cancel
                            </Button>
                        </Space>
                    </div>
                ) : (
                    post.caption && (
                        <Paragraph style={{ marginBottom: 16, fontSize: 15 }}>
                            {post.caption}
                        </Paragraph>
                    )
                )}

                <Divider style={{ margin: "12px 0" }} />

                {/* Comments section */}
                <Title level={5} style={{ margin: "0 0 12px 0" }}>
                    Comments ({post.comments.length})
                </Title>

                {post.comments.length > 0 ? (
                    <List
                        style={{ maxHeight: 240, overflowY: "auto" }}
                        dataSource={post.comments}
                        renderItem={(comment) => (
                            <List.Item style={{ padding: "8px 0", borderBottom: "none" }}>
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            size={28}
                                            src={comment.author.avatar}
                                            icon={!comment.author.avatar && <UserOutlined />}
                                        />
                                    }
                                    title={
                                        <Space size={8}>
                                            <Text strong style={{ fontSize: 13 }}>
                                                {comment.author.name || "Anonymous"}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 11 }}>
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </Text>
                                        </Space>
                                    }
                                    description={<Text style={{ fontSize: 13 }}>{comment.content}</Text>}
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Text type="secondary" style={{ display: "block", textAlign: "center", padding: "16px 0" }}>
                        No comments yet. Be the first!
                    </Text>
                )}

                {/* Comment input */}
                <Space.Compact style={{ width: "100%", marginTop: 12 }}>
                    <Input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment…"
                        maxLength={500}
                        onPressEnter={handleAddComment}
                        disabled={commentSubmitting}
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleAddComment}
                        loading={commentSubmitting}
                        disabled={!commentText.trim()}
                    />
                </Space.Compact>
            </div>
        </Modal>
    );
};

export default PhotoOverlay;
