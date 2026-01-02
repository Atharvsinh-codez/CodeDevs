import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { Settings } from '@/lib/config/settings';
import { NormalizedProfile, AboutData, SEOData } from '@/types/github';

const groq = createGroq({
  apiKey: Settings.GROQ_API_KEY,
});

export class AIDescriptionGenerator {
  private model = groq('llama-3.3-70b-versatile');

  async generateProfileSummary(profile: NormalizedProfile): Promise<AboutData> {
    try {
      const prompt = this.buildProfilePrompt(profile);

      const { text } = await generateText({
        model: this.model,
        system:
          'You are an expert technical writer creating professional developer profiles. Your goal is to craft unique, compelling descriptions that authentically represent each developer. Avoid generic templates or formulaic language. Instead, analyze the specific data provided and create personalized content that highlights what makes this developer distinctive. Focus on their actual achievements, technical depth, and unique contributions. Write in a professional yet engaging tone suitable for a portfolio website. Every profile should feel authentic and tailored, not templated.',
        prompt,
        temperature: 0.7,
        maxOutputTokens: 800,
      });

      return this.parseProfileSummary(text, profile);
    } catch (error) {
      console.error('Failed to generate AI profile summary:', error);
      return this.generateFallbackSummary(profile);
    }
  }

  async generateSEOContents(profile: NormalizedProfile): Promise<SEOData> {
    try {
      const prompt = this.buildSEOPrompt(profile);

      const { text } = await generateText({
        model: this.model,
        system: 'You are an SEO expert. Generate SEO-optimized metadata for developer portfolios.',
        prompt,
        temperature: 0.5,
        maxOutputTokens: 300,
      });

      return this.parseSEOContent(text, profile);
    } catch (error) {
      console.error('Failed to generate SEO content:', error);
      return this.generateFallbackSEO(profile);
    }
  }

  private buildProfilePrompt(profile: NormalizedProfile): string {
    const metrics = profile.metrics ? `
PRs Merged: ${profile.metrics.prs_merged}
PRs Open: ${profile.metrics.prs_open}
Total Contributions: ${profile.metrics.total_contributions || 0}
Issues Opened: ${profile.metrics.issues_opened || 0}
Issues Closed: ${profile.metrics.issues_closed || 0}
` : '';

    const yearsActive = profile.created_at 
      ? Math.floor((new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365))
      : 0;

    const contributionRate = profile.metrics?.total_contributions && yearsActive > 0
      ? Math.round(profile.metrics.total_contributions / yearsActive)
      : null;

    return `Analyze the following developer profile and create a unique, professional description that authentically represents their work and achievements. Avoid generic templates or formulaic language.

Developer Profile:
Name: ${profile.name || profile.username}
Username: ${profile.username}
Bio: ${profile.bio || 'Not provided'}
Location: ${profile.location || 'Not specified'}
Company: ${profile.company || 'Not specified'}
Website: ${profile.website || 'Not specified'}
Public Repositories: ${profile.public_repos}
Followers: ${profile.followers}
Following: ${profile.following}
GitHub Member Since: ${profile.created_at ? new Date(profile.created_at).getFullYear() : 'N/A'}
Years Active: ${yearsActive > 0 ? yearsActive : 'N/A'}
${metrics}
${contributionRate ? `Average Contributions/Year: ${contributionRate}` : ''}

Based on this data, generate:

1. Summary (3-4 sentences, 150-200 words):
   - Write a compelling narrative that tells their story, not a template
   - If they have a bio, use it as context but expand and professionalize it
   - Highlight what makes them unique: their contribution patterns, repository count, community engagement, or professional background
   - If they have high metrics, emphasize their impact and consistency
   - If they're newer, focus on their growth trajectory and potential
   - Mention specific achievements (e.g., "maintains X repositories" vs "has repositories")
   - Connect their work to real-world impact when possible
   - Use varied sentence structure - avoid repetitive patterns
   - DO NOT use phrases like "is a skilled developer" or "has expertise in" unless contextually appropriate

2. Highlights (4-5 items):
   - Prioritize the most impressive and unique metrics
   - Format: Concise, metric-focused statements
   - Include: "${profile.public_repos} public repositories" (if > 0)
   - Include: "${profile.followers} GitHub followers" (if > 0)
   - Include: "${profile.metrics?.prs_merged || 0} merged pull requests" (if > 0 and > 10)
   - Include: "${profile.metrics?.total_contributions || 0} total contributions" (if > 0 and > 100)
   - Include: "${contributionRate} average contributions per year" (if contributionRate > 50)
   - Include: "Active for ${yearsActive} years" (if yearsActive >= 3)
   - Include: "Based in ${profile.location}" (if location exists and is meaningful)
   - Only include metrics that are meaningful (avoid zeros or very low numbers)

3. Skills (6-10 items):
   - Infer skills from their activity patterns, not from generic assumptions
   - If they have many repos: "Repository Management", "Project Architecture"
   - If they have many PRs: "Code Review", "Collaborative Development"
   - If they have many contributions: "Open Source Contributions", "Community Engagement"
   - If they have a company: "Enterprise Software Development"
   - If yearsActive >= 5: "Software Engineering", "Technical Leadership"
   - Always include: "Version Control" (they use Git)
   - Add technical skills based on their bio if mentioned
   - Use specific, professional terminology
   - Avoid generic terms like "Coding" or "Programming"

CRITICAL: 
- Create unique content, not a template
- Analyze the actual data to infer their focus areas
- Return ONLY valid JSON - no markdown, no explanations
- Start with { and end with }

{
  "summary": "Write a unique, compelling 3-4 sentence professional summary...",
  "highlights": ["metric 1", "metric 2", "metric 3", "metric 4"],
  "skills": ["Skill 1", "Skill 2", "Skill 3", ...]
}`;
  }

  private buildSEOPrompt(profile: NormalizedProfile): string {
    return `Generate SEO metadata for ${profile.name || profile.username}'s developer portfolio.

Bio: ${profile.bio || 'Not provided'}
Public Repositories: ${profile.public_repos}

Provide:
1. SEO title (50-60 characters)
2. Meta description (150-160 characters)
3. 5-10 relevant keywords

IMPORTANT: Return ONLY valid JSON. Do not include markdown code blocks, explanations, or any text outside the JSON object. Start with { and end with }.

{
  "title": "...",
  "description": "...",
  "keywords": ["...", "..."]
}`;
  }

  private parseProfileSummary(content: string, profile: NormalizedProfile): AboutData {
    try {
      let jsonString = this.extractJSON(content);
      if (!jsonString) {
        console.error('No JSON found in AI response:', content.substring(0, 200));
        return this.generateFallbackSummary(profile);
      }

      jsonString = this.cleanJSON(jsonString);
      const parsed = JSON.parse(jsonString);
      
      return {
        summary: parsed.summary || '',
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Response content:', content.substring(0, 500));
      return this.generateFallbackSummary(profile);
    }
  }

  private parseSEOContent(content: string, profile: NormalizedProfile): SEOData {
    try {
      let jsonString = this.extractJSON(content);
      if (!jsonString) {
        console.error('No JSON found in SEO response:', content.substring(0, 200));
        return this.generateFallbackSEO(profile);
      }

      jsonString = this.cleanJSON(jsonString);
      const parsed = JSON.parse(jsonString);
      
      return {
        title: parsed.title || '',
        description: parsed.description || '',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      };
    } catch (error) {
      console.error('Failed to parse SEO response:', error);
      console.error('Response content:', content.substring(0, 500));
      return this.generateFallbackSEO(profile);
    }
  }

  private generateFallbackSummary(profile: NormalizedProfile): AboutData {
    const name = profile.name || profile.username;
    return {
      summary:
        profile.bio ||
        `${name} is a developer with ${profile.public_repos} public repositories on GitHub.`,
      highlights: [
        `${profile.public_repos} public repositories`,
        `${profile.followers} followers on GitHub`,
        profile.location ? `Based in ${profile.location}` : 'Active developer',
      ],
      skills: ['Software Development', 'Open Source', 'GitHub'],
    };
  }

  private generateFallbackSEO(profile: NormalizedProfile): SEOData {
    const name = profile.name || profile.username;
    return {
      title: `${name} - Developer Portfolio`,
      description: profile.bio || `${name}'s developer portfolio showcasing projects and contributions on GitHub.`,
      keywords: ['developer', 'portfolio', 'github', profile.username, 'software engineer'],
    };
  }

  private extractJSON(content: string): string | null {
    if (!content) return null;

    const trimmed = content.trim();

    const markdownCodeBlockRegex = /```(?:json)?\s*(\{[\s\S]*\})\s*```/;
    const markdownMatch = trimmed.match(markdownCodeBlockRegex);
    if (markdownMatch && markdownMatch[1]) {
      return markdownMatch[1].trim();
    }

    let braceCount = 0;
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === '{') {
        if (startIndex === -1) {
          startIndex = i;
        }
        braceCount++;
      } else if (trimmed[i] === '}') {
        braceCount--;
        if (braceCount === 0 && startIndex !== -1) {
          endIndex = i;
          break;
        }
      }
    }

    if (startIndex !== -1 && endIndex !== -1) {
      return trimmed.substring(startIndex, endIndex + 1);
    }

    const fallbackMatch = trimmed.match(/\{[\s\S]*\}/);
    return fallbackMatch ? fallbackMatch[0] : null;
  }

  private cleanJSON(jsonString: string): string {
    let cleaned = jsonString.trim();

    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');

    cleaned = cleaned.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '');

    cleaned = cleaned.replace(/,\s*}/g, '}');
    cleaned = cleaned.replace(/,\s*]/g, ']');

    const trailingCommaRegex = /,(\s*[}\]])/g;
    cleaned = cleaned.replace(trailingCommaRegex, '$1');

    return cleaned;
  }
}

