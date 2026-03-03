"use client";

import { Row, Col, Empty, Skeleton, Card } from "antd";
import { PictureOutlined } from "@ant-design/icons";
import { useMainPage } from "@/context/MainPageContext";
import PhotoCard from "./PhotoCard";
import PhotoOverlay from "./PhotoOverlay";

const PhotoFeed = () => {
    const {
        posts,
        loading,
        selectedPost,
        selectPost,
        clearSelectedPost,
    } = useMainPage();

    if (loading && posts.length === 0) {
        return (
            <Row gutter={[24, 24]}>
                {[...Array(6)].map((_, i) => (
                    <Col key={i} xs={24} sm={12} lg={8}>
                        <Card
                            style={{ height: 420 }}
                            styles={{ body: { padding: 16 } }}
                            cover={
                                <div style={{
                                    aspectRatio: "1 / 1",
                                    width: "100%",
                                    background: "#f5f5f5",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderBottom: "1px solid #f0f0f0"
                                }}>
                                    <PictureOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                                </div>
                            }
                        >
                            <Skeleton
                                active
                                paragraph={{ rows: 2 }}
                                style={{ marginTop: 0 }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    }

    if (posts.length === 0) {
        return (
            <Empty
                image={
                    <PictureOutlined
                        style={{ fontSize: 64, color: "#d9d9d9" }}
                    />
                }
                description="No posts yet"
                style={{ padding: "48px 0" }}
            >
                <span style={{ color: "#8c8c8c" }}>
                    Upload your first photo to get started!
                </span>
            </Empty>
        );
    }

    return (
        <>
            <Row gutter={[24, 24]}>
                {posts.map((post, i) => (
                    <Col key={post.id} xs={24} sm={12} lg={8}>
                        <PhotoCard
                            post={post}
                            onClick={() => selectPost(post.id)}
                            index={i}
                        />
                    </Col>
                ))}
            </Row>

            {selectedPost && (
                <PhotoOverlay
                    post={selectedPost}
                    onClose={clearSelectedPost}
                />
            )}
        </>
    );
};

export default PhotoFeed;
