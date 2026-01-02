import { NextRequest, NextResponse } from 'next/server';
import { LinkedInProfileFetcher } from '@/lib/modules/linkedin/fetcher';
import { verifyLinkedinUsername } from '@/lib/utils/user';
import { createCachedFunction } from '@/lib/utils/cache';

function getCachedLinkedInProfile(username: string) {
  const cachedFn = createCachedFunction(
    async () => {
      const fetcher = new LinkedInProfileFetcher();
      return fetcher.fetchProfileAsync(username);
    },
    ['linkedin_profile', username],
    {
      ttl: 86400,
      tags: ['linkedin_profile', `user:${username}`],
    }
  );
  return cachedFn();
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username: rawUsername } = await context.params;
    const username = verifyLinkedinUsername(rawUsername);

    const profileData = await getCachedLinkedInProfile(username);

    return NextResponse.json(profileData, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Invalid') || errorMessage.includes('not found')) {
      return NextResponse.json(
        { detail: errorMessage },
        { status: 400 }
      );
    }

    console.error('LinkedIn fetch error:', error);
    return NextResponse.json(
      { detail: `Failed to fetch LinkedIn profile: ${errorMessage}` },
      { status: 500 }
    );
  }
}

