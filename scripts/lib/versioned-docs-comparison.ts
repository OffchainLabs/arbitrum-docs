/**
 * The comparison-selection decision behind scripts/versioned-docs-check.ts, as a pure function so
 * it can be tested without a git fixture (FS-2747). The script itself owns the git probing and the
 * environment reading, and passes the results in.
 *
 * Why the shape matters. On a `pull_request` run, `actions/checkout` checks out the synthetic merge
 * commit GitHub builds for the pull request (`refs/pull/<n>/merge`), whose **first** parent is the
 * base branch's tip at event time and whose second is the PR head. So `git diff HEAD^1 HEAD` is
 * exactly the PR's own change set, with no network call and no credentials, provided the checkout
 * fetched that parent: `fetch-depth: 2` in ci.yml is what puts it there, and the default depth-1
 * checkout grafts `HEAD` parentless instead.
 *
 * Both signals are load-bearing and neither substitutes for the other. `GITHUB_BASE_REF` says the
 * run is a pull request, which is the only event whose `HEAD` has a base as its first parent. The
 * merge-commit probe says the checkout actually holds that shape, so a checkout pinned to the PR
 * head (no merge commit, first parent is just the previous commit on the branch) is not mistaken
 * for one.
 *
 * Everywhere else `HEAD` is an ordinary commit with no base to compare against, and the check falls
 * back to its local behavior (working tree + staged vs `HEAD`). That fallback is not dead weight:
 * it is the whole point locally, before a `git commit`, and it is also the meaningful comparison in
 * `upstream-refresh.yml`'s `stylus` job, where `pnpm stylus:generate` has just rewritten the tree
 * and the changes really are uncommitted.
 */

/**
 * The comparison a run uses. `args` are the `git diff` positional refs, `label` names the
 * comparison for the printed output, `note` explains a fallback, and `annotate` asks for a GitHub
 * Actions warning annotation rather than a plain line.
 */
export interface Comparison {
  args: string[];
  label: string;
  note?: string;
  annotate?: boolean;
}

/** What the script probes before deciding. */
export interface ComparisonState {
  /** Running under GitHub Actions. */
  ci: boolean;
  /** A `pull_request`-triggered run (`GITHUB_BASE_REF` set). */
  pullRequest: boolean;
  /** `HEAD^1` resolves in this checkout. */
  firstParentPresent: boolean;
  /** `HEAD^2` resolves, i.e. `HEAD` is a merge commit. */
  secondParentPresent: boolean;
}

const LOCAL_LABEL = 'HEAD (working tree + staged vs HEAD)';

/** Picks the comparison a run should use. */
export function pickComparison({
  ci,
  pullRequest,
  firstParentPresent,
  secondParentPresent,
}: ComparisonState): Comparison {
  if (!ci) return { args: ['HEAD'], label: LOCAL_LABEL };

  if (pullRequest) {
    if (firstParentPresent && secondParentPresent) {
      return {
        args: ['HEAD^1', 'HEAD'],
        label: "HEAD^1 vs HEAD (this pull request's merge commit against its base)",
      };
    }
    return {
      args: ['HEAD'],
      label: LOCAL_LABEL,
      // The actionable one, and the exact failure FS-2747 closed. A checkout without
      // `fetch-depth: 2` grafts HEAD parentless, and one pinned to the PR head is not a merge at
      // all; either way this check silently goes back to comparing a clean tree against itself.
      note: "this is a pull request run, but HEAD is not a merge commit with its first parent present, so the pull request's own changes cannot be compared. The `actions/checkout` step needs `fetch-depth: 2` and the default ref.",
      annotate: true,
    };
  }

  return {
    args: ['HEAD'],
    label: LOCAL_LABEL,
    // A `push` run, or a scheduled job such as `upstream-refresh.yml`'s `stylus`. Accepted for
    // `push`: a merge into `main` goes through a pull request first, and that run compared the
    // right two trees. Not a gap at all for `stylus`, where the generator has just written to the
    // working tree and this is the comparison that finds it.
    note: 'not a pull request run, so there is no base to compare against and only uncommitted changes are visible. On a push to `main` that means nothing is reported, because the checkout is clean; the pull request that merged here is where the comparison ran.',
  };
}
