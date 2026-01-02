import { NextRequest, NextResponse } from 'next/server';
import { verifyUsername } from '@/lib/utils/user';
import { resolveProfile } from '@/lib/services/profile-cache';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username: rawUsername } = await context.params;
    const username = verifyUsername(rawUsername);

    const { profile } = await resolveProfile(username);

    return NextResponse.json(
      { about: profile.about ?? null, cached: profile.cached ?? false },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Invalid')) {
      return NextResponse.json(
        { detail: errorMessage },
        { status: 400 }
      );
    }
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { detail: errorMessage },
        { status: 404 }
      );
    }

    console.error('About fetch error:', error);
    return NextResponse.json(
      { detail: `Failed to fetch about data: ${errorMessage}` },
      { status: 500 }
    );
  }
}

