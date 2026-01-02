import { FeaturedProject, ProjectsData } from '@/types/github';
import { Settings } from '@/lib/config/settings';
import { GitHubRepositoryFetcher, Repository } from './repository-fetcher';
import { ProjectScorer } from './project-scorer';
import { LanguageRanker } from './language-ranker';
import { graphql } from '@octokit/graphql';

function getGraphQLClient(token: string) {
  return graphql.defaults({
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

const REPO_DETAILS_QUERY_PUBLIC = `
  query($username: String!) {
    user(login: $username) {
      repositories(first: 100, privacy: PUBLIC, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          name
          description
          url
          homepageUrl
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          updatedAt
          createdAt
        }
      }
    }
  }
`;

const REPO_DETAILS_QUERY_ALL = `
  query($username: String!) {
    user(login: $username) {
      repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          name
          description
          url
          homepageUrl
          stargazerCount
          forkCount
          primaryLanguage {
            name
            color
          }
          languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
            edges {
              size
              node {
                name
                color
              }
            }
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
          updatedAt
          createdAt
        }
      }
    }
  }
`;

interface GraphQLRepository {
  name: string;
  description: string | null;
  url: string;
  homepageUrl: string | null;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
  languages: {
    edges: Array<{
      size: number;
      node: {
        name: string;
        color: string;
      };
    }>;
  };
  repositoryTopics: {
    nodes: Array<{
      topic: {
        name: string;
      };
    }>;
  };
  updatedAt: string;
  createdAt: string;
}

export class GitHubProjectRanker {
  private static async enrichRepositoriesWithGraphQL(
    username: string,
    userToken?: string | null
  ): Promise<Map<string, GraphQLRepository>> {
    try {
      const token = userToken || Settings.GITHUB_TOKEN;
      if (!token) {
        return new Map();
      }

      const graphqlClient = getGraphQLClient(token);
      const isAuthenticatedUser = userToken !== null;
      const query = isAuthenticatedUser ? REPO_DETAILS_QUERY_ALL : REPO_DETAILS_QUERY_PUBLIC;

      const result = await graphqlClient<{
        user: {
          repositories: {
            nodes: GraphQLRepository[];
          };
        } | null;
      }>(query, {
        username,
      });

      if (!result.user) {
        return new Map();
      }

      const repoMap = new Map<string, GraphQLRepository>();
      result.user.repositories.nodes.forEach(repo => {
        repoMap.set(repo.name, repo);
      });

      return repoMap;
    } catch {
      return new Map();
    }
  }

  private static normalizeHomepageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    
    const trimmed = url.trim();
    if (!trimmed) return null;
    
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        new URL(trimmed);
        return trimmed;
      } catch {
        return null;
      }
    }
    
    if (trimmed.startsWith('//')) {
      return `https:${trimmed}`;
    }
    
    return `https://${trimmed}`;
  }

  private static convertToFeaturedProject(
    repo: Repository,
    gqlRepo?: GraphQLRepository
  ): FeaturedProject {
    if (gqlRepo) {
      const languages: { [key: string]: number } = {};
      gqlRepo.languages.edges.forEach(edge => {
        languages[edge.node.name] = edge.size;
      });

      return {
        name: gqlRepo.name,
        description: gqlRepo.description,
        url: gqlRepo.url,
        homepage: this.normalizeHomepageUrl(gqlRepo.homepageUrl),
        stars: gqlRepo.stargazerCount,
        forks: gqlRepo.forkCount,
        language: gqlRepo.primaryLanguage?.name || null,
        topics: gqlRepo.repositoryTopics.nodes.map(node => node.topic.name),
        updated_at: gqlRepo.updatedAt,
        created_at: gqlRepo.createdAt,
        languages,
      };
    }

    return {
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      homepage: this.normalizeHomepageUrl(repo.homepage),
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      topics: repo.topics || [],
      updated_at: repo.updated_at,
      created_at: repo.created_at,
      languages: {},
    };
  }

  static async getFeatured(username: string, userToken?: string | null): Promise<ProjectsData> {
    const token = userToken || Settings.GITHUB_TOKEN;
    if (!token) {
      throw new Error(
        'GITHUB_TOKEN is required. Please set it in your environment variables or authenticate.'
      );
    }

    try {
      const [allRepos, pinnedRepoNames] = await Promise.all([
        GitHubRepositoryFetcher.fetchAllRepositories(username, userToken),
        GitHubRepositoryFetcher.fetchPinnedRepositories(username),
      ]);

      const topScoredRepos = ProjectScorer.getTopProjects(
        allRepos,
        pinnedRepoNames,
        8
      );

      const gqlRepoMap = await this.enrichRepositoriesWithGraphQL(username, userToken);

      const featured: FeaturedProject[] = topScoredRepos.map(repo =>
        this.convertToFeaturedProject(repo, gqlRepoMap.get(repo.name))
      );

      const nonForkRepos = allRepos.filter(
        repo => !repo.fork && !repo.archived && !repo.disabled
      );

      const totalStars = nonForkRepos.reduce(
        (sum, repo) => sum + repo.stargazers_count,
        0
      );

      const languages = LanguageRanker.getAllLanguages(nonForkRepos);

      return {
        featured,
        languages,
        total_stars: totalStars,
        total_repos: nonForkRepos.length,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch projects: ${errorMessage}`);
    }
  }
}
