import { Settings } from '@/lib/config/settings';
import { generatePortfolioProfile } from '@/lib/services/profile';
import { CacheOptions, getCache, getCacheKey, setCache } from '@/lib/utils/cache';
import type { NormalizedProfile } from '@/types/github';

const PROFILE_CACHE_PREFIX = 'github_profile';

const buildProfileTags = (username: string, extraTags?: string[]) => {
  const baseTags = ['github_profile', `user:${username}`];
  if (!extraTags || extraTags.length === 0) {
    return baseTags;
  }
  const tagSet = new Set([...baseTags, ...extraTags]);
  return Array.from(tagSet);
};

export interface CachedProfileResult {
  profile: NormalizedProfile;
  cached: boolean;
  cacheKey: string;
}

export async function resolveProfile(
  username: string,
  options: CacheOptions & { userToken?: string | null; isOwner?: boolean } = {}
): Promise<CachedProfileResult> {
  const cacheKey = getCacheKey(PROFILE_CACHE_PREFIX, username);
  const tags = buildProfileTags(username, options.tags);
  const ttl = options.ttl ?? Settings.DEFAULT_CACHE_TTL;

  const cachedProfile = await getCache<NormalizedProfile>(cacheKey);
  if (cachedProfile && !options.isOwner) {
    const profileWithCacheFlag = {
      ...cachedProfile,
      cached: true as const,
    };
    return {
      profile: profileWithCacheFlag,
      cached: true,
      cacheKey,
    };
  }

  const tokenToUse = options.isOwner ? options.userToken : null;
  const freshProfile = await generatePortfolioProfile(username, tokenToUse);
  const profileToCache = { ...freshProfile, cached: false };

  await setCache(cacheKey, profileToCache, { ttl, tags });

  return {
    profile: profileToCache,
    cached: false,
    cacheKey,
  };
}


