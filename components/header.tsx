"use client";

import {
    Layout,
    Typography,
    Space,
    Avatar,
    Dropdown,
    message,
} from "antd";
import {
    CameraOutlined,
    UserOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

const Header = () => {
    const { user, isAuthenticated, loginWithGoogle, logout, loading } =
        useAuth();

    const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
        if (!credentialResponse.credential) {
            message.error("Google login failed — no credential received.");
            return;
        }

        try {
            await loginWithGoogle(credentialResponse.credential);
            message.success("Welcome!");
        } catch (err) {
            message.error(
                err instanceof Error ? err.message : "Login failed"
            );
        }
    };

    const handleLogout = () => {
        logout();
        message.info("Logged out");
    };

    const userMenuItems = [
        {
            key: "profile",
            label: (
                <div style={{ padding: "4px 0" }}>
                    <Text strong>{user?.name || "User"}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {user?.email}
                    </Text>
                </div>
            ),
            disabled: true,
        },
        { type: "divider" as const },
        {
            key: "logout",
            label: "Log out",
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <AntHeader
            style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid #f0f0f0",
                padding: "0 24px",
                height: 64,
            }}
        >
            <div
                style={{
                    maxWidth: 960,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {/* Logo */}
                <Space align="center" size={12}>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background:
                                "linear-gradient(135deg, #1677ff22, #1677ff11)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <CameraOutlined
                            style={{ fontSize: 20, color: "#1677ff" }}
                        />
                    </div>
                    <Title
                        level={4}
                        style={{ margin: 0, letterSpacing: "-0.02em" }}
                    >
                        SnapShare
                    </Title>
                </Space>

                {/* Auth section */}
                {!loading && (
                    <>
                        {isAuthenticated ? (
                            <Dropdown
                                menu={{ items: userMenuItems }}
                                placement="bottomRight"
                                trigger={["click"]}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        cursor: "pointer",
                                        padding: "4px 12px",
                                        borderRadius: 24,
                                        transition: "background 0.2s",
                                    }}
                                    onMouseEnter={(e) =>
                                    (e.currentTarget.style.background =
                                        "#f0f2f5")
                                    }
                                    onMouseLeave={(e) =>
                                    (e.currentTarget.style.background =
                                        "transparent")
                                    }
                                >
                                    <Avatar
                                        size={32}
                                        src={user?.avatar}
                                        icon={
                                            !user?.avatar && <UserOutlined />
                                        }
                                        style={{
                                            background: "#1677ff",
                                        }}
                                    />
                                    <Text strong style={{ fontSize: 14 }}>
                                        {user?.name || "User"}
                                    </Text>
                                </div>
                            </Dropdown>
                        ) : (
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() =>
                                    message.error("Google login failed")
                                }
                                shape="pill"
                                size="medium"
                                text="signin_with"
                                theme="outline"
                            />
                        )}
                    </>
                )}
            </div>
        </AntHeader>
    );
};

export default Header;
