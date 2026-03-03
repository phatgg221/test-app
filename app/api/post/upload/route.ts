import { NextRequest, NextResponse } from "next/server";
import { uploadToS3 } from "@/utils/s3";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: "No files provided. Use field name 'files'." },
                { status: 400 }
            );
        }

        // Validate all files before uploading
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    {
                        error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(", ")}`,
                    },
                    { status: 400 }
                );
            }
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    {
                        error: `File "${file.name}" exceeds the 5MB size limit.`,
                    },
                    { status: 400 }
                );
            }
        }

        // Upload all files to S3
        const urls: string[] = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Generate unique S3 key: posts/timestamp-randomstring.ext
            const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`;
            const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
            const s3Key = `posts/${uniqueName}`;

            const url = await uploadToS3(buffer, s3Key, file.type);
            urls.push(url);
        }

        return NextResponse.json(
            {
                data: {
                    urls,
                    count: urls.length,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error uploading files:", error);
        return NextResponse.json(
            { error: "Failed to upload files" },
            { status: 500 }
        );
    }
}
