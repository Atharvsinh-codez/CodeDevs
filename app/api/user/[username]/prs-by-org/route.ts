import { NextRequest, NextResponse } from 'next/server';
import { GitHubPRsByOrgFetcher } from '@/lib/modules/github/prs-by-org';
import { getCache, setCache } from '@/lib/utils/cache';
import type { PRByOrg } from '@/lib/modules/github/prs-by-org';

const CACHE_TTL = 3600;

async function fetchPRsByOrg(username: string) {
  return GitHubPRsByOrgFetcher.fetchPRsByOrg(username);
}

function getCachedPRsByOrg(username: string) {
  return getCache<PRByOrg[]>(`prs-by-org:${username}`);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const cached = await getCachedPRsByOrg(username);
    if (cached) {
      return NextResponse.json(cached);
    }

    const data = await fetchPRsByOrg(username);
    await setCache(`prs-by-org:${username}`, data, {
      ttl: CACHE_TTL,
      tags: ['prs', `user:${username}`],
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching PRs by org for ${username}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch PRs by organization' },
      { status: 500 }
    );
  }
}

