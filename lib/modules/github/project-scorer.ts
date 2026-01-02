import { Repository } from './repository-fetcher';

interface ScoredRepository extends Repository {
  score: number;
  isPinned: boolean;
}

export class ProjectScorer {
  private static readonly STAR_WEIGHT = 2.0;
  private static readonly FORK_WEIGHT = 1.5;
  private static readonly RECENCY_WEIGHT = 1.0;
  private static readonly PINNED_WEIGHT = 10.0;

  static calculateScore(
    repo: Repository,
    pinnedRepos: string[]
  ): number {
    const stars = repo.stargazers_count || 0;
    const forks = repo.forks_count || 0;
    const isPinned = pinnedRepos.includes(repo.name);

    const createdAt = new Date(repo.created_at);
    const updatedAt = new Date(repo.updated_at);
    const now = new Date();

    const daysSinceCreation = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysSinceUpdate = Math.floor(
      (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const starScore = Math.log1p(stars) * this.STAR_WEIGHT;
    const forkScore = Math.log1p(forks) * this.FORK_WEIGHT;

    let recencyBonus = 0.5;
    if (daysSinceUpdate <= 365) {
      recencyBonus = 1.5;
    } else if (daysSinceUpdate <= 730) {
      recencyBonus = 1.0;
    }

    const recencyScore =
      this.RECENCY_WEIGHT *
      recencyBonus *
      (1 / Math.log1p(daysSinceCreation));

    const pinnedBonus = isPinned ? this.PINNED_WEIGHT : 0;

    const totalScore = starScore + forkScore + recencyScore + pinnedBonus;

    return totalScore;
  }

  static scoreRepositories(
    repos: Repository[],
    pinnedRepos: string[]
  ): ScoredRepository[] {
    return repos
      .filter(repo => !repo.fork && !repo.archived && !repo.disabled)
      .map(repo => ({
        ...repo,
        score: this.calculateScore(repo, pinnedRepos),
        isPinned: pinnedRepos.includes(repo.name),
      }))
      .sort((a, b) => b.score - a.score);
  }

  static getTopProjects(
    repos: Repository[],
    pinnedRepos: string[],
    topN: number = 8
  ): ScoredRepository[] {
    const scored = this.scoreRepositories(repos, pinnedRepos);
    return scored.slice(0, topN);
  }
}

