import { LinkedInProfile } from '@/types/api';

export class LinkedInProfileFetcher {
  async fetchProfileAsync(username: string): Promise<LinkedInProfile> {
    try {
      const response = await fetch(`https://www.linkedin.com/in/${username}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`LinkedIn profile not found for username: ${username}`);
        }
        throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();

      const profile: LinkedInProfile = {
        username,
        name: this.extractName(html),
        headline: this.extractHeadline(html),
        location: this.extractLocation(html),
        profile_url: `https://www.linkedin.com/in/${username}`,
        avatar_url: this.extractAvatarUrl(html),
        summary: this.extractSummary(html),
        experience: this.extractExperience(html),
        education: this.extractEducation(html),
        skills: this.extractSkills(html),
      };

      return profile;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch LinkedIn profile: ${errorMessage}`);
    }
  }

  private extractName(html: string): string | null {
    const nameMatch = html.match(/<title>([^|<]+)/);
    return nameMatch ? nameMatch[1].trim() : null;
  }

  private extractHeadline(html: string): string | null {
    const headlineMatch = html.match(/"headline":"([^"]+)"/);
    return headlineMatch ? headlineMatch[1] : null;
  }

  private extractLocation(html: string): string | null {
    const locationMatch = html.match(/"locationName":"([^"]+)"/);
    return locationMatch ? locationMatch[1] : null;
  }

  private extractAvatarUrl(html: string): string | null {
    const avatarMatch = html.match(/"profilePicture":\{"displayImageReference":\{"vectorImage":\{"artifacts":\[.*?"https:\/\/[^"]+"/);
    if (avatarMatch) {
      const urlMatch = avatarMatch[0].match(/https:\/\/[^"]+/);
      return urlMatch ? urlMatch[0] : null;
    }
    return null;
  }

  private extractSummary(html: string): string | null {
    const summaryMatch = html.match(/"summary":"([^"]+)"/);
    return summaryMatch ? summaryMatch[1] : null;
  }

  private extractExperience(_html: string): Array<{
    title: string;
    company: string;
    duration: string;
    description?: string;
  }> {
    return [];
  }

  private extractEducation(_html: string): Array<{
    school: string;
    degree: string;
    field: string;
    duration: string;
  }> {
    return [];
  }

  private extractSkills(_html: string): string[] {
    return [];
  }
}

