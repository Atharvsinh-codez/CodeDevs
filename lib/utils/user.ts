const GITHUB_USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
const LINKEDIN_USERNAME_REGEX = /^[a-zA-Z0-9-]{3,100}$/;
const FILENAME_EXTENSION_REGEX = /\.(js|css|json|html|xml|svg|png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|map)$/i;

export function verifyUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    throw new Error('Username is required');
  }

  const trimmedUsername = username.trim().toLowerCase();

  if (FILENAME_EXTENSION_REGEX.test(trimmedUsername)) {
    throw new Error('Invalid username: appears to be a filename');
  }

  if (!GITHUB_USERNAME_REGEX.test(trimmedUsername)) {
    throw new Error(
      'Invalid GitHub username format. Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.'
    );
  }

  return trimmedUsername;
}

export function verifyLinkedinUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    throw new Error('LinkedIn username is required');
  }

  const trimmedUsername = username.trim();

  if (!LINKEDIN_USERNAME_REGEX.test(trimmedUsername)) {
    throw new Error(
      'Invalid LinkedIn username format. Username must be 3-100 characters and contain only alphanumeric characters and hyphens.'
    );
  }

  return trimmedUsername;
}

export async function getUserData(username: string) {
  const validatedUsername = verifyUsername(username);
  return { username: validatedUsername };
}

