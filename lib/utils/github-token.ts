import { auth } from "@/lib/auth";
import { prisma } from "@/lib/utils/db";

export async function getUserGitHubToken(userId?: string): Promise<string | null> {
  if (!userId) {
    return null;
  }

  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "github",
      },
      select: {
        accessToken: true,
      },
    });

    return account?.accessToken || null;
  } catch {
    return null;
  }
}

export async function getSessionUserToken(request?: Request): Promise<string | null> {
  try {
    const headers = request ? new Headers(request.headers) : new Headers();
    const session = await auth.api.getSession({
      headers,
    });

    if (!session?.user?.id) {
      return null;
    }

    return getUserGitHubToken(session.user.id);
  } catch {
    return null;
  }
}

