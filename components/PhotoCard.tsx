"use client";

import { Card, Image, Typography, Space } from "antd";
import { CommentOutlined } from "@ant-design/icons";
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
                cover={
                    coverPhoto ? (
                        <div style={{ aspectRatio: "1 / 1", overflow: "hidden" }}>
                            <Image
                                src={coverPhoto.url}
                                alt={post.caption || "Post photo"}
                                width="100%"
                                height="100%"
                                style={{ objectFit: "cover" }}
                                loading="lazy"
                                preview={false}
                            />
                        </div>
                    ) : (
                        <div
                            style={{
                                aspectRatio: "1 / 1",
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
                    body: { padding: 16 },
                }}
            >
                {post.caption && (
                    <Text
                        ellipsis={{ tooltip: post.caption }}
                        style={{ display: "block", marginBottom: 8 }}
                    >
                        {post.caption}
                    </Text>
                )}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Space size={4}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {post.author.name || "Anonymous"}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            ·
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDistanceToNow(new Date(post.createdAt), {
                                addSuffix: true,
                            })}
                        </Text>
                    </Space>

                    <Space size={4}>
                        <CommentOutlined
                            style={{ fontSize: 14, color: "#8c8c8c" }}
                        />
                        <Text type="secondary">{post._count.comments}</Text>
                    </Space>
                </div>

                {post.photos.length > 1 && (
                    <Text
                        type="secondary"
                        style={{ fontSize: 12, marginTop: 4, display: "block" }}
                    >
                        {post.photos.length} photos
                    </Text>
                )}
            </Card>
        </div>
    );
};

export default PhotoCard;
