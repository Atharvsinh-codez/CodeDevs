import { NextRequest, NextResponse } from 'next/server';
import { GitHubContributionsFetcher } from '@/lib/modules/github/contributions';
import { verifyUsername } from '@/lib/utils/user';
import { createCachedFunction } from '@/lib/utils/cache';

function getCachedContributions(username: string) {
  const cachedFn = createCachedFunction(
    () => GitHubContributionsFetcher.fetchContributions(username),
    ['github_contributions', username],
    {
      ttl: 3600,
      tags: ['github_contributions', `user:${username}`],
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
    const username = verifyUsername(rawUsername);

    const contributions = await getCachedContributions(username);

    return NextResponse.json(contributions, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('not found') || errorMessage.includes('Invalid')) {
      return NextResponse.json(
        { detail: errorMessage },
        { status: 404 }
      );
    }

    console.error('Contributions fetch error:', error);
    return NextResponse.json(
      { detail: `Failed to fetch contributions: ${errorMessage}` },
      { status: 500 }
    );
  }
}

