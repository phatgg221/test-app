"use client";

import { Card, Image, Typography, Space, Skeleton } from "antd";
import { CommentOutlined, PictureOutlined } from "@ant-design/icons";
import { type Post } from "@/context/MainPageContext";
import { formatDistanceToNow } from "date-fns";

const { Text } = Typography;

interface PhotoCardProps {
    post: Post;
    onClick: () => void;
    index: number;
}

const PhotoCard = ({ post, onClick, index }: PhotoCardProps) => {
    const coverPhoto = post.photos[0];

    return (
        <div
            style={{
                animationDelay: `${index * 80}ms`,
                animationName: "fadeIn",
                animationDuration: "0.4s",
                animationFillMode: "both",
            }}
        >
            <Card
                hoverable
                onClick={onClick}
                style={{ height: 420, display: "flex", flexDirection: "column", overflow: "hidden" }}
                cover={
                    coverPhoto ? (
                        <div style={{ aspectRatio: "1 / 1", width: "100%", overflow: "hidden", background: "#f5f5f5" }}>
                            <Image
                                src={coverPhoto.url}
                                alt={post.caption || "Post photo"}
                                width="100%"
                                height="100%"
                                style={{ objectFit: "cover" }}
                                loading="lazy"
                                preview={false}
                                placeholder={
                                    <div style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: "#f5f5f5"
                                    }}>
                                        <Skeleton.Node active style={{ width: "100%", height: "100%" }}>
                                            <PictureOutlined style={{ fontSize: 32, color: "#d9d9d9" }} />
                                        </Skeleton.Node>
                                    </div>
                                }
                            />
                        </div>
                    ) : (
                        <div
                            style={{
                                aspectRatio: "1 / 1",
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#f5f5f5",
                                color: "#bfbfbf",
                                fontSize: 14,
                            }}
                        >
                            No photo
                        </div>
                    )
                }
                styles={{
                    body: { padding: 16, flex: 1, display: "flex", flexDirection: "column" },
                }}
            >
                {post.caption && (
                    <div
                        className="caption-html"
                        style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            marginBottom: 8,
                            fontSize: 14,
                        }}
                        dangerouslySetInnerHTML={{ __html: post.caption }}
                    />
                )}

                <div style={{ marginTop: "auto" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Space size={4} style={{ overflow: "hidden" }}>
                            <Text
                                type="secondary"
                                style={{ fontSize: 12 }}
                                ellipsis
                            >
                                {post.author.name || "Anonymous"}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                ·
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12, whiteSpace: "nowrap" }}>
                                {formatDistanceToNow(new Date(post.createdAt), {
                                    addSuffix: true,
                                })}
                            </Text>
                        </Space>

                        <Space size={4} style={{ flexShrink: 0 }}>
                            <CommentOutlined
                                style={{ fontSize: 14, color: "#8c8c8c" }}
                            />
                            <Text type="secondary">{post._count.comments}</Text>
                        </Space>
                    </div>

                    <div style={{ height: 20 }}>
                        {post.photos.length > 1 && (
                            <Text
                                type="secondary"
                                style={{ fontSize: 12, marginTop: 4, display: "block" }}
                            >
                                {post.photos.length} photos
                            </Text>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PhotoCard;
