export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  x?: string;
  instagram?: string;
}

type SocialPlatform = 'linkedin' | 'twitter' | 'instagram';

interface LinkMatch {
  url: string;
  similarity: number;
}

function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function normalizeUrl(url: string, baseUrl?: string): string {
  if (!url) return '';
  
  url = url.trim();
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  if (baseUrl && !url.startsWith('/')) {
    return `${baseUrl}/${url}`;
  }
  
  return `https://${url}`;
}

function canonicalizeSocialUrl(platform: SocialPlatform, value: string): string | null {
  if (!value) return null;
  let candidate = value.trim();
  if (!candidate) return null;

  candidate = candidate.replace(/^[<\[\(]+/, '').replace(/[>\]\)]+$/, '');

  const looksLikeUrl =
    candidate.startsWith('http://') ||
    candidate.startsWith('https://') ||
    candidate.startsWith('//');

  const containsDomain = /linkedin\.com|twitter\.com|x\.com|instagram\.com/i.test(candidate);

  if (looksLikeUrl || containsDomain) {
    return normalizeUrl(candidate);
  }

  let handle = candidate.replace(/^[@/#]+/, '').trim();
  if (!handle) return null;

  handle = handle
    .replace(/^in\//i, '')
    .replace(/[^a-zA-Z0-9_.-]/g, '')
    .replace(/\.+$/, '');

  if (!handle) return null;

  switch (platform) {
    case 'linkedin':
      return `https://www.linkedin.com/in/${handle}`;
    case 'twitter':
      return `https://x.com/${handle}`;
    case 'instagram':
      return `https://instagram.com/${handle}`;
    default:
      return null;
  }
}

function findBestMatch(
  content: string,
  username: string,
  patterns: RegExp[],
  platform: SocialPlatform
): string | null {
  const allMatches: LinkMatch[] = [];
  
  for (const pattern of patterns) {
    const matches = content.matchAll(pattern);
    
    for (const match of matches) {
      const rawValue = match[1] || match[0];
      const url = canonicalizeSocialUrl(platform, rawValue);

      if (url) {
        const extractedHandle = extractHandleFromUrl(url);
        const similarity = extractedHandle
          ? calculateSimilarity(username.toLowerCase(), extractedHandle.toLowerCase())
          : 0.5;
        
        allMatches.push({ url, similarity });
      }
    }
  }
  
  if (allMatches.length === 0) {
    return null;
  }
  
  allMatches.sort((a, b) => b.similarity - a.similarity);
  
  return allMatches[0].url;
}

function extractHandleFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    const linkedinMatch = pathname.match(/\/in\/([a-zA-Z0-9-]+)/);
    if (linkedinMatch) return linkedinMatch[1];
    
    const twitterMatch = pathname.match(/\/([a-zA-Z0-9_]+)$/);
    if (twitterMatch && (urlObj.hostname.includes('twitter.com') || urlObj.hostname.includes('x.com'))) {
      return twitterMatch[1];
    }
    
    const instagramMatch = pathname.match(/\/([a-zA-Z0-9_.]+)$/);
    if (instagramMatch && urlObj.hostname.includes('instagram.com')) {
      return instagramMatch[1];
    }
    
    return null;
  } catch {
    const match = url.match(/(?:linkedin\.com\/in\/|twitter\.com\/|x\.com\/|instagram\.com\/)([a-zA-Z0-9_.-]+)/);
    return match ? match[1] : null;
  }
}

export function parseSocialLinksFromReadme(
  readmeContent: string,
  username?: string
): SocialLinks {
  const links: SocialLinks = {};
  const targetUsername = username || '';

  const linkedinPatterns = [
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)/gi,
    /linkedin\.com\/in\/([a-zA-Z0-9-]+)/gi,
    /\[LinkedIn\]\((https?:\/\/[^\s\)]+linkedin\.com[^\s\)]+)\)/gi,
    /\[LinkedIn\]\((https?:\/\/[^\s\)]+linkedin\.com\/in\/[^\s\)]+)\)/gi,
    /linkedin:\s*(https?:\/\/[^\s]+)/gi,
    /<a[^>]*href=["'](https?:\/\/[^"']*linkedin\.com[^"']*)["'][^>]*>/gi,
    /href=["'](https?:\/\/[^"']*linkedin\.com[^"']*)["']/gi,
    /linkedin[:\s]+(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)/gi,
  ];

  const linkedinUrl = findBestMatch(readmeContent, targetUsername, linkedinPatterns, 'linkedin');
  if (linkedinUrl) {
    links.linkedin = normalizeUrl(linkedinUrl);
  }

  const twitterPatterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/gi,
    /twitter\.com\/([a-zA-Z0-9_]+)/gi,
    /x\.com\/([a-zA-Z0-9_]+)/gi,
    /\[Twitter\]\((https?:\/\/[^\s\)]+(?:twitter|x)\.com[^\s\)]+)\)/gi,
    /\[X\]\((https?:\/\/[^\s\)]+(?:twitter|x)\.com[^\s\)]+)\)/gi,
    /twitter:\s*(https?:\/\/[^\s]+)/gi,
    /x:\s*(https?:\/\/[^\s]+)/gi,
    /@([a-zA-Z0-9_]+)/gi,
  ];

  const twitterUrl = findBestMatch(readmeContent, targetUsername, twitterPatterns, 'twitter');
  if (twitterUrl) {
    const normalized = normalizeUrl(twitterUrl).replace(/x\.com/i, 'twitter.com');
    links.twitter = normalized;
    links.x = normalized.replace(/twitter\.com/i, 'x.com');
  }

  const instagramPatterns = [
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]+)/gi,
    /instagram\.com\/([a-zA-Z0-9_.]+)/gi,
    /\[Instagram\]\((https?:\/\/[^\s\)]+instagram\.com[^\s\)]+)\)/gi,
    /instagram:\s*(https?:\/\/[^\s]+)/gi,
    /<a[^>]*href=["'](https?:\/\/[^"']*instagram\.com[^"']*)["'][^>]*>/gi,
  ];

  const instagramUrl = findBestMatch(readmeContent, targetUsername, instagramPatterns, 'instagram');
  if (instagramUrl) {
    links.instagram = normalizeUrl(instagramUrl);
  }

  return links;
}
