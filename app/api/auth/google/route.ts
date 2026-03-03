import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { createToken } from "@/lib/auth";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { credential } = body;

        if (!credential) {
            return NextResponse.json(
                { error: "Google credential is required" },
                { status: 400 }
            );
        }

        // Verify the Google ID token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return NextResponse.json(
                { error: "Invalid Google token" },
                { status: 401 }
            );
        }

        const { email, name, picture, sub: googleId } = payload;

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                name: name || undefined,
                avatar: picture || undefined,
            },
            create: {
                email,
                name: name || null,
                avatar: picture || null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
            },
        });

        // Create a JWT token
        const token = await createToken({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
        });

        return NextResponse.json({
            data: user,
            token: token
        });
    } catch (error) {
        console.error("Google auth error:", error);
        return NextResponse.json(
            { error: "Google authentication failed" },
            { status: 500 }
        );
    }
}
