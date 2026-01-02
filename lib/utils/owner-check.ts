import { getSessionGitHubUsername } from "./github-username";

export async function isOwner(request: Request | undefined, username: string): Promise<boolean> {
  try {
    const authenticatedUsername = await getSessionGitHubUsername(request);
    if (!authenticatedUsername) {
      return false;
    }
    return authenticatedUsername.toLowerCase() === username.toLowerCase();
  } catch {
    return false;
  }
}

