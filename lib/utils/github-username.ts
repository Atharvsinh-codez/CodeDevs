import { auth } from "@/lib/auth";
import { prisma } from "@/lib/utils/db";
import { getUserGitHubToken } from "./github-token";

export async function getUserGitHubUsername(userId?: string): Promise<string | null> {
  if (!userId) {
    return null;
  }

  try {
    const token = await getUserGitHubToken(userId);
    if (!token) {
      return null;
    }

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const userData = await response.json();
    return userData.login || null;
  } catch {
    return null;
  }
}

export async function getSessionGitHubUsername(request?: Request): Promise<string | null> {
  try {
    const headers = request ? new Headers(request.headers) : new Headers();
    const session = await auth.api.getSession({
      headers,
    });

    if (!session?.user?.id) {
      return null;
    }

    return getUserGitHubUsername(session.user.id);
  } catch {
    return null;
  }
}

