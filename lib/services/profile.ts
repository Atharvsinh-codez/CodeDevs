import { GitHubProfileFetcher } from '@/lib/modules/github/fetcher';
import { AIDescriptionGenerator } from '@/lib/modules/ai/generator';
import type { NormalizedProfile, AboutData, SEOData } from '@/types/github';
import { getCache, setCache, getCacheKey } from '@/lib/utils/cache';

const ABOUT_CACHE_PREFIX = 'ai_about';
const SEO_CACHE_PREFIX = 'ai_seo';
const ABOUT_CACHE_TTL = 30 * 24 * 60 * 60;

export async function generatePortfolioProfile(username: string, userToken?: string | null): Promise<NormalizedProfile> {
  const basicProfile = await GitHubProfileFetcher.fetchUserProfile(username, userToken);
  basicProfile.cached = false;

  const aboutCacheKey = getCacheKey(ABOUT_CACHE_PREFIX, username);
  const seoCacheKey = getCacheKey(SEO_CACHE_PREFIX, username);

  const [cachedAbout, cachedSEO] = await Promise.all([
    getCache<AboutData>(aboutCacheKey),
    getCache<SEOData>(seoCacheKey),
  ]);

  if (cachedAbout && cachedSEO) {
    basicProfile.about = cachedAbout;
    basicProfile.seo = cachedSEO;
    return basicProfile;
  }

  try {
    const aiGenerator = new AIDescriptionGenerator();
    const [aboutData, seoData] = await Promise.all([
      cachedAbout ? Promise.resolve(cachedAbout) : aiGenerator.generateProfileSummary(basicProfile),
      cachedSEO ? Promise.resolve(cachedSEO) : aiGenerator.generateSEOContents(basicProfile),
    ]);

    basicProfile.about = aboutData;
    basicProfile.seo = seoData;

    await Promise.all([
      aboutData && !cachedAbout ? setCache(aboutCacheKey, aboutData, {
        ttl: ABOUT_CACHE_TTL,
        tags: ['ai_about', `user:${username}`],
      }) : Promise.resolve(),
      seoData && !cachedSEO ? setCache(seoCacheKey, seoData, {
        ttl: ABOUT_CACHE_TTL,
        tags: ['ai_seo', `user:${username}`],
      }) : Promise.resolve(),
    ]);
  } catch (error) {
    console.error('Failed to generate AI description:', error);
    basicProfile.about = cachedAbout || null;
    basicProfile.seo = cachedSEO || null;
  }

  return basicProfile;
}


