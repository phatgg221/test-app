import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const authorId = searchParams.get("authorId");
        const skip = (page - 1) * limit;

        const where = authorId ? { authorId } : {};

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                    photos: {
                        orderBy: { order: "asc" },
                    },
                    comments: {
                        orderBy: { createdAt: "desc" },
                        include: {
                            author: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: { comments: true },
                    },
                },
            }),
            prisma.post.count({ where }),
        ]);

        return NextResponse.json({
            data: posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json(
            { error: "Failed to fetch posts" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/post
 * Create a new post with optional photos.
 * Body: { authorId: string, caption?: string, photos?: { url: string, order?: number }[] }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { authorId, caption, photos } = body;

        if (!authorId) {
            return NextResponse.json(
                { error: "authorId is required" },
                { status: 400 }
            );
        }

        // Verify the author exists
        const author = await prisma.user.findUnique({
            where: { id: authorId },
        });

        if (!author) {
            return NextResponse.json(
                { error: "Author not found" },
                { status: 404 }
            );
        }

        const post = await prisma.post.create({
            data: {
                caption,
                authorId,
                photos:
                    photos && photos.length > 0
                        ? {
                            create: photos.map(
                                (
                                    photo: { url: string; order?: number },
                                    index: number
                                ) => ({
                                    url: photo.url,
                                    order: photo.order ?? index,
                                })
                            ),
                        }
                        : undefined,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                photos: {
                    orderBy: { order: "asc" },
                },
                comments: true,
            },
        });

        return NextResponse.json({ data: post }, { status: 201 });
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json(
            { error: "Failed to create post" },
            { status: 500 }
        );
    }
}