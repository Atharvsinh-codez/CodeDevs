import { Repository } from './repository-fetcher';

interface LanguageComplexity {
  [key: string]: number;
}

const LANGUAGE_COMPLEXITY: LanguageComplexity = {
  Rust: 9.5,
  C: 8.5,
  'C++': 8.0,
  Haskell: 9.0,
  Scala: 8.5,
  Go: 8.0,
  Julia: 8.5,
  R: 7.5,
  TypeScript: 7.5,
  Kotlin: 7.5,
  Swift: 7.0,
  Python: 6.5,
  Ruby: 6.0,
  JavaScript: 5.5,
  Erlang: 9.0,
  Clojure: 8.5,
  Elixir: 8.0,
  Elm: 7.5,
  Crystal: 7.0,
  Nim: 7.0,
  Unknown: 3.0,
  HTML: 3.0,
  CSS: 3.0,
  Shell: 4.0,
};

interface LanguageScore {
  language: string;
  count: number;
  total_score: number;
}

export class LanguageRanker {
  static getTopLanguages(
    repos: Repository[],
    topN: number = 3
  ): Array<[string, number]> {
    const languageCounts = new Map<string, number>();

    repos
      .filter(repo => !repo.fork && !repo.archived && !repo.disabled)
      .forEach(repo => {
        const language = repo.language || 'Unknown';
        languageCounts.set(language, (languageCounts.get(language) || 0) + 1);
      });

    const totalRepos = Array.from(languageCounts.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalRepos === 0) {
      return [];
    }

    const scoredLanguages: LanguageScore[] = [];

    languageCounts.forEach((count, language) => {
      if (language === 'Unknown') {
        return;
      }

      const complexityScore = LANGUAGE_COMPLEXITY[language] || 5.0;
      const usageFactor = Math.sqrt(count / totalRepos) * 10;
      const totalScore = complexityScore * 0.6 + usageFactor * 0.4;

      scoredLanguages.push({
        language,
        count,
        total_score: totalScore,
      });
    });

    const ranked = scoredLanguages.sort(
      (a, b) => b.total_score - a.total_score
    );

    return ranked.slice(0, topN).map(lang => [lang.language, lang.count]);
  }

  static getAllLanguages(repos: Repository[]): { [key: string]: number } {
    const languages: { [key: string]: number } = {};

    repos
      .filter(repo => !repo.fork && !repo.archived && !repo.disabled)
      .forEach(repo => {
        const language = repo.language || 'Unknown';
        languages[language] = (languages[language] || 0) + 1;
      });

    return languages;
  }
}

