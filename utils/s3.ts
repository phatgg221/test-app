import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

if (!process.env.AWS_S3_REGION) {
    throw new Error("AWS_S3_REGION is not set");
}

if (!process.env.AWS_S3_BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME is not set");
}

export const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
    },
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export async function uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string
): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });

    await s3Client.send(command);

    return `https://${BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
}

export async function deleteFromS3(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    await s3Client.send(command);
}


export function getS3KeyFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        return urlObj.pathname.slice(1);
    } catch {
        return null;
    }
}
