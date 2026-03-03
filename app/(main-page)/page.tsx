"use client";

import { Typography, Button, Alert, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { MainPageProvider, useMainPage } from "@/context/MainPageContext";
import { CreatePostProvider } from "@/context/CreatePostContext";
import UploadForm from "@/components/UploadForm";
import PhotoFeed from "@/components/PhotoFeed";

const { Title } = Typography;

export default function Page() {
  return (
    <MainPageProvider>
      <MainPageContent />
    </MainPageProvider>
  );
}

function MainPageContent() {
  const { error, hasMore, loading, loadMore, refreshPosts } = useMainPage();

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <main
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "32px 16px",
        }}
      >
        <Space
          direction="vertical"
          size="large"
          style={{ width: "100%" }}
        >
          <CreatePostProvider onPostCreated={refreshPosts}>
            <UploadForm />
          </CreatePostProvider>

          <section>
            <Title level={4} style={{ marginBottom: 20 }}>
              Photo Feed
            </Title>

            {error && (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                action={
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={refreshPosts}
                  >
                    Retry
                  </Button>
                }
                style={{ marginBottom: 24 }}
              />
            )}

            <PhotoFeed />

            {hasMore && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: 32,
                }}
              >
                <Button
                  onClick={loadMore}
                  loading={loading}
                  size="large"
                >
                  Load more
                </Button>
              </div>
            )}
          </section>
        </Space>
      </main>
    </div>
  );
}
