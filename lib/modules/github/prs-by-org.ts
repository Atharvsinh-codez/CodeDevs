import { graphql } from '@octokit/graphql';
import { Settings } from '@/lib/config/settings';

const graphqlWithAuth = Settings.GITHUB_TOKEN
  ? graphql.defaults({
      headers: {
        authorization: `Bearer ${Settings.GITHUB_TOKEN}`,
      },
    })
  : graphql;

const PRS_BY_ORG_QUERY = `
  query($username: String!, $first: Int!) {
    user(login: $username) {
      pullRequests(first: $first, states: [MERGED], orderBy: { field: UPDATED_AT, direction: DESC }) {
        nodes {
          number
          title
          url
          state
          mergedAt
          createdAt
          updatedAt
          repository {
            name
            owner {
              login
              avatarUrl
              ... on Organization {
                name
              }
              ... on User {
                name
              }
            }
          }
          baseRefName
          headRefName
        }
      }
    }
  }
`;

export interface PRByOrg {
  orgName: string;
  orgAvatar: string;
  orgLogin: string;
  prs: Array<{
    number: number;
    title: string;
    url: string;
    state: string;
    mergedAt: string | null;
    createdAt: string;
    updatedAt: string;
    repository: string;
    baseRef: string;
    headRef: string;
    ownerLogin: string;
  }>;
}

export class GitHubPRsByOrgFetcher {
  static async fetchPRsByOrg(username: string): Promise<PRByOrg[]> {
    if (!Settings.GITHUB_TOKEN) {
      return [];
    }

    try {
      const result = await graphqlWithAuth<{
        user: {
          pullRequests: {
            nodes: Array<{
              number: number;
              title: string;
              url: string;
              state: string;
              mergedAt: string | null;
              createdAt: string;
              updatedAt: string;
              repository: {
                name: string;
                owner: {
                  login: string;
                  avatarUrl: string;
                  name?: string | null;
                };
              };
              baseRefName: string;
              headRefName: string;
            }>;
          } | null;
        } | null;
      }>(PRS_BY_ORG_QUERY, { username, first: 100 });

      if (!result.user?.pullRequests?.nodes) {
        return [];
      }

      const orgMap = new Map<string, PRByOrg>();

      for (const pr of result.user.pullRequests.nodes) {
        // Defensive: query already restricts to MERGED, but guard anyway.
        if (!pr.mergedAt) {
          continue;
        }

        const owner = pr.repository.owner;
        const ownerLogin = owner.login;

        // Skip PRs merged into repos owned by the same login as the author.
        if (ownerLogin.toLowerCase() === username.toLowerCase()) {
          continue;
        }

        const orgName = owner.name || owner.login;
        const orgAvatar = owner.avatarUrl;

        if (!orgMap.has(orgName)) {
          orgMap.set(orgName, {
            orgName,
            orgAvatar,
            orgLogin: ownerLogin,
            prs: [],
          });
        }

        const org = orgMap.get(orgName)!;
        org.prs.push({
          number: pr.number,
          title: pr.title,
          url: pr.url,
          state: pr.state,
          mergedAt: pr.mergedAt,
          createdAt: pr.createdAt,
          updatedAt: pr.updatedAt,
          repository: pr.repository.name,
          baseRef: pr.baseRefName,
          headRef: pr.headRefName,
          ownerLogin,
        });
      }

      return Array.from(orgMap.values()).sort((a, b) => b.prs.length - a.prs.length);
    } catch (error) {
      console.error('Failed to fetch PRs by org:', error);
      return [];
    }
  }
}

