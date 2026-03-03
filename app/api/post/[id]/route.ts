import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const post = await prisma.post.findUnique({
            where: { id },
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
        });

        if (!post) {
            return NextResponse.json(
                { error: "Post not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: post });
    } catch (error) {
        console.error("Error fetching post:", error);
        return NextResponse.json(
            { error: "Failed to fetch post" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { caption, photos } = body;

        const existing = await prisma.post.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Ownership check
        if (existing.authorId !== authUser.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const post = await prisma.$transaction(async (tx) => {
            if (photos !== undefined) {
                await tx.photo.deleteMany({ where: { postId: id } });
            }

            return tx.post.update({
                where: { id },
                data: {
                    ...(caption !== undefined && { caption }),
                    ...(photos !== undefined && {
                        photos: {
                            create: photos.map(
                                (
                                    photo: { url: string; order?: number },
                                    index: number
                                ) => ({
                                    url: photo.url,
                                    order: photo.order ?? index,
                                })
                            ),
                        },
                    }),
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
                    _count: { select: { comments: true } },
                },
            });
        });

        return NextResponse.json({ data: post });
    } catch (error) {
        console.error("Error updating post:", error);
        return NextResponse.json(
            { error: "Failed to update post" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        const existing = await prisma.post.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        // Ownership check
        if (existing.authorId !== authUser.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.post.delete({ where: { id } });

        return NextResponse.json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json(
            { error: "Failed to delete post" },
            { status: 500 }
        );
    }
}
