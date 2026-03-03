"use client";

import { useState } from "react";
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
} from "antd";
import {
    CloseOutlined,
    SendOutlined,
    UserOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import { type Post } from "@/context/MainPageContext";
import { useMainPage } from "@/context/MainPageContext";
import { formatDistanceToNow } from "date-fns";

const { Text, Paragraph, Title } = Typography;

interface PhotoOverlayProps {
    post: Post;
    onClose: () => void;
}

const PhotoOverlay = ({ post, onClose }: PhotoOverlayProps) => {
    const { addComment, commentSubmitting } = useMainPage();
    const [commentText, setCommentText] = useState("");

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
            {/* Photo carousel */}
            {post.photos.length > 0 ? (
                <div
                    style={{
                        background: "#000",
                        borderRadius: "8px 8px 0 0",
                    }}
                >
                    {post.photos.length === 1 ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                maxHeight: 480,
                            }}
                        >
                            <Image
                                src={post.photos[0].url}
                                alt={post.caption || "Post photo"}
                                style={{
                                    maxHeight: 480,
                                    objectFit: "contain",
                                    width: "100%",
                                }}
                            />
                        </div>
                    ) : (
                        <Carousel
                            dots
                            arrows
                            style={{ maxHeight: 480 }}
                        >
                            {post.photos.map((photo) => (
                                <div key={photo.id}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            height: 480,
                                            background: "#000",
                                        }}
                                    >
                                        <Image
                                            src={photo.url}
                                            alt={
                                                post.caption || "Post photo"
                                            }
                                            style={{
                                                maxHeight: 480,
                                                objectFit: "contain",
                                            }}
                                            preview={false}
                                        />
                                    </div>
                                </div>
                            ))}
                        </Carousel>
                    )}
                </div>
            ) : (
                <div
                    style={{
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#fafafa",
                        borderRadius: "8px 8px 0 0",
                    }}
                >
                    <Space direction="vertical" align="center">
                        <PictureOutlined
                            style={{ fontSize: 48, color: "#d9d9d9" }}
                        />
                        <Text type="secondary">No photos</Text>
                    </Space>
                </div>
            )}

            {/* Post info */}
            <div style={{ padding: "20px 24px" }}>
                {/* Author + timestamp */}
                <Space
                    align="center"
                    size={12}
                    style={{ marginBottom: 12 }}
                >
                    <Avatar
                        size={36}
                        src={post.author.avatar}
                        icon={
                            !post.author.avatar && <UserOutlined />
                        }
                    />
                    <div>
                        <Text strong>
                            {post.author.name || "Anonymous"}
                        </Text>
                        <br />
                        <Text
                            type="secondary"
                            style={{ fontSize: 12 }}
                        >
                            {formatDistanceToNow(
                                new Date(post.createdAt),
                                {
                                    addSuffix: true,
                                }
                            )}
                        </Text>
                    </div>
                </Space>

                {/* Caption */}
                {post.caption && (
                    <Paragraph style={{ marginBottom: 16 }}>
                        {post.caption}
                    </Paragraph>
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
                            <List.Item
                                style={{
                                    padding: "8px 0",
                                    borderBottom: "none",
                                }}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            size={28}
                                            src={comment.author.avatar}
                                            icon={
                                                !comment.author
                                                    .avatar && (
                                                    <UserOutlined />
                                                )
                                            }
                                        />
                                    }
                                    title={
                                        <Space size={8}>
                                            <Text
                                                strong
                                                style={{
                                                    fontSize: 13,
                                                }}
                                            >
                                                {comment.author
                                                    .name ||
                                                    "Anonymous"}
                                            </Text>
                                            <Text
                                                type="secondary"
                                                style={{
                                                    fontSize: 11,
                                                }}
                                            >
                                                {formatDistanceToNow(
                                                    new Date(
                                                        comment.createdAt
                                                    ),
                                                    {
                                                        addSuffix:
                                                            true,
                                                    }
                                                )}
                                            </Text>
                                        </Space>
                                    }
                                    description={
                                        <Text
                                            style={{
                                                fontSize: 13,
                                            }}
                                        >
                                            {comment.content}
                                        </Text>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <Text
                        type="secondary"
                        style={{
                            display: "block",
                            textAlign: "center",
                            padding: "16px 0",
                        }}
                    >
                        No comments yet. Be the first!
                    </Text>
                )}

                {/* Comment input */}
                <Space.Compact
                    style={{ width: "100%", marginTop: 12 }}
                >
                    <Input
                        value={commentText}
                        onChange={(e) =>
                            setCommentText(e.target.value)
                        }
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
