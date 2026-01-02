import { NextRequest, NextResponse } from 'next/server';
import { GitHubProjectRanker } from '@/lib/modules/github/projects';
import { verifyUsername } from '@/lib/utils/user';
import { createCachedFunction } from '@/lib/utils/cache';
import { getSessionUserToken } from '@/lib/utils/github-token';
import { isOwner } from '@/lib/utils/owner-check';

function getCachedProjects(username: string, userToken?: string | null, isOwnerViewing: boolean = false) {
  const cacheKey = `github_projects_${username}`;
  const tokenToUse = isOwnerViewing ? userToken : null;
  
  const cachedFn = createCachedFunction(
    () => GitHubProjectRanker.getFeatured(username, tokenToUse),
    [cacheKey, username],
    {
      ttl: 3600,
      tags: ['github_projects', `user:${username}`],
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

    const userToken = await getSessionUserToken(request);
    const ownerViewing = await isOwner(request, username);
    const projectData = await getCachedProjects(username, userToken, ownerViewing);

    return NextResponse.json(projectData, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('not found') || errorMessage.includes('Invalid')) {
      return NextResponse.json(
        { detail: `User ${errorMessage}` },
        { status: 404 }
      );
    }

    console.error('Projects fetch error:', error);
    return NextResponse.json(
      { detail: `Failed to fetch projects: ${errorMessage}` },
      { status: 500 }
    );
  }
}

