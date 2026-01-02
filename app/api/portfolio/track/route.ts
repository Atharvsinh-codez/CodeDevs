import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/utils/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { githubUsername, name, avatarUrl } = body;

        if (!githubUsername) {
            return NextResponse.json(
                { error: 'GitHub username is required' },
                { status: 400 }
            );
        }

        // Upsert - create if not exists, update if exists
        const result = await prisma.portfolioGeneration.upsert({
            where: { githubUsername: githubUsername.toLowerCase() },
            update: {
                name: name || undefined,
                avatarUrl: avatarUrl || undefined,
            },
            create: {
                githubUsername: githubUsername.toLowerCase(),
                name: name || null,
                avatarUrl: avatarUrl || null,
            },
        });

        return NextResponse.json({ success: true, id: result.id });
    } catch (error) {
        console.error('Failed to track portfolio:', error);
        return NextResponse.json(
            { error: 'Failed to track portfolio generation' },
            { status: 500 }
        );
    }
}
