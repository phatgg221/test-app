import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/login
 * Simple login by email (no password hashing for now — add bcrypt later).
 * Body: { email: string, password: string }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "No account found with this email" },
                { status: 404 }
            );
        }

        // TODO: Add proper password verification with bcrypt
        // For now, we just check if the user exists

        return NextResponse.json({ data: user });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Login failed" },
            { status: 500 }
        );
    }
}
