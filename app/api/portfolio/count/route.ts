import { NextResponse } from 'next/server';
import { prisma } from '@/lib/utils/db';

export async function GET() {
    try {
        const count = await prisma.portfolioGeneration.count();

        // Also get the latest 5 portfolios for display
        const latest = await prisma.portfolioGeneration.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                githubUsername: true,
                name: true,
                avatarUrl: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ count, latest });
    } catch (error) {
        console.error('Failed to get portfolio count:', error);
        return NextResponse.json({ count: 0, latest: [] });
    }
}
