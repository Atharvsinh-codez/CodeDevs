import { prisma } from './db';

const CUSTOM_SLUG_REGEX = /^[a-z0-9]([a-z0-9.-]{0,38}[a-z0-9])?$/i;
const RESERVED_SLUGS = [
  'api',
  'admin',
  'app',
  'www',
  'mail',
  'ftp',
  'localhost',
  'about',
  'contact',
  'help',
  'terms',
  'privacy',
  'login',
  'signup',
  'dashboard',
  'settings',
  'profile',
  'account',
];

export function validateCustomSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug || typeof slug !== 'string') {
    return { valid: false, error: 'Custom URL is required' };
  }

  const trimmedSlug = slug.trim().toLowerCase();

  if (trimmedSlug.length < 3) {
    return { valid: false, error: 'Custom URL must be at least 3 characters' };
  }

  if (trimmedSlug.length > 40) {
    return { valid: false, error: 'Custom URL must be less than 40 characters' };
  }

  if (!CUSTOM_SLUG_REGEX.test(trimmedSlug)) {
    return {
      valid: false,
      error: 'Custom URL can only contain lowercase letters, numbers, dots, and hyphens. Cannot start or end with a hyphen or dot.',
    };
  }

  if (RESERVED_SLUGS.includes(trimmedSlug)) {
    return { valid: false, error: 'This custom URL is reserved and cannot be used' };
  }

  return { valid: true };
}

export async function isCustomSlugAvailable(slug: string): Promise<boolean> {
  const validation = validateCustomSlug(slug);
  if (!validation.valid) {
    return false;
  }

  try {
    const existing = await prisma.customUrl.findUnique({
      where: { customSlug: slug.toLowerCase() },
    });
    return !existing;
  } catch (error) {
    console.error('Error checking custom slug availability:', error);
    return false;
  }
}

export async function getGithubUsernameByCustomSlug(slug: string): Promise<string | null> {
  try {
    const customUrl = await prisma.customUrl.findUnique({
      where: { customSlug: slug.toLowerCase() },
    });
    return customUrl?.githubUsername || null;
  } catch (error) {
    console.error('Error fetching GitHub username by custom slug:', error);
    return null;
  }
}

export async function createCustomUrl(customSlug: string, githubUsername: string): Promise<{ success: boolean; error?: string }> {
  const validation = validateCustomSlug(customSlug);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const normalizedSlug = customSlug.toLowerCase().trim();

  try {
    const existing = await prisma.customUrl.findUnique({
      where: { customSlug: normalizedSlug },
    });

    if (existing) {
      if (existing.githubUsername === githubUsername) {
        return { success: true };
      }
      return { success: false, error: 'This custom URL is already taken. Please choose another one.' };
    }

    await prisma.customUrl.create({
      data: {
        customSlug: normalizedSlug,
        githubUsername,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating custom URL:', error);
    return { success: false, error: 'Failed to create custom URL. Please try again.' };
  }
}

