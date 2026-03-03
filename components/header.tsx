import { CameraOutlined } from "@ant-design/icons";

const Header = () => {
    return (
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">

                    <CameraOutlined />
                </div>
                <h1 className="text-2xl font-display font-semibold text-foreground tracking-tight">
                    SnapShare
                </h1>
            </div>
        </header>
    );
};

export default Header;
