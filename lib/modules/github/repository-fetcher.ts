import { Settings } from '@/lib/config/settings';

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  topics: string[];
}

export class GitHubRepositoryFetcher {
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (Settings.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${Settings.GITHUB_TOKEN}`;
    }

    return headers;
  }

  static async fetchAllRepositories(username: string, userToken?: string | null): Promise<Repository[]> {
    const token = userToken || Settings.GITHUB_TOKEN;
    
    if (!token) {
      const url = `https://api.github.com/users/${username}/repos?page=1&per_page=100&sort=updated&direction=desc`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`User ${username} not found`);
        }
        throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    }

    const repos: Repository[] = [];
    let page = 1;
    const perPage = 100;

    try {
      const { graphql } = await import('@octokit/graphql');
      const graphqlWithAuth = graphql.defaults({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const viewerQuery = `
        query {
          viewer {
            login
          }
        }
      `;

      const viewerResult = await graphqlWithAuth<{ viewer: { login: string } }>(viewerQuery);
      const authenticatedUsername = viewerResult.viewer.login.toLowerCase();

      if (authenticatedUsername === username.toLowerCase()) {
        const authHeaders: HeadersInit = {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token}`,
        };

        while (true) {
          const url = `https://api.github.com/user/repos?page=${page}&per_page=${perPage}&sort=updated&direction=desc&affiliation=owner`;
          
          const response = await fetch(url, {
            headers: authHeaders,
          });

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Invalid GitHub token. Please check your GITHUB_TOKEN environment variable.');
            }
            if (response.status === 403) {
              throw new Error('GitHub API rate limit exceeded or token lacks required permissions (repo scope needed for private repos).');
            }
            throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText}`);
          }

          const pageRepos: Repository[] = await response.json();

          if (pageRepos.length === 0) {
            break;
          }

          repos.push(...pageRepos);
          page++;

          if (pageRepos.length < perPage) {
            break;
          }
        }

        return repos;
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('token')) {
        throw error;
      }
    }

    while (true) {
      const url = `https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated&direction=desc`;
      
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`User ${username} not found`);
        }
        if (response.status === 403) {
          throw new Error('GitHub API rate limit exceeded or token lacks required permissions.');
        }
        throw new Error(`Failed to fetch repositories: ${response.status} ${response.statusText}`);
      }

      const pageRepos: Repository[] = await response.json();

      if (pageRepos.length === 0) {
        break;
      }

      repos.push(...pageRepos);
      page++;

      if (pageRepos.length < perPage) {
        break;
      }
    }

    return repos;
  }

  static async fetchPinnedRepositories(username: string): Promise<string[]> {
    const { graphql } = await import('@octokit/graphql');
    
    const graphqlWithAuth = Settings.GITHUB_TOKEN
      ? graphql.defaults({
          headers: {
            authorization: `Bearer ${Settings.GITHUB_TOKEN}`,
          },
        })
      : graphql;

    const query = `
      query($username: String!) {
        user(login: $username) {
          pinnedItems(first: 6, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name
              }
            }
          }
        }
      }
    `;

    try {
      const result = await graphqlWithAuth<{
        user: {
          pinnedItems: {
            nodes: Array<{ name: string }>;
          };
        } | null;
      }>(query, { username });

      if (!result.user) {
        return [];
      }

      return result.user.pinnedItems.nodes.map(node => node.name);
    } catch {
      return [];
    }
  }
}

