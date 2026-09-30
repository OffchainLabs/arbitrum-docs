# Migration parity dashboard

Temporary. This branch lives in a do-not-merge PR against `fumadocs` and is closed before cutover.

It compares every page in the production sitemap (https://docs.arbitrum.io, Docusaurus) with a
build of the Fumadocs site, scores each page, and publishes the result as static JSON that the PR's
Vercel preview serves at `/parity/index.html`.

## What a run measures

Each production URL gets six parameters, each 0 to 1:

| Parameter | 1 means                                                                 |
| --------- | ----------------------------------------------------------------------- |
| resolves  | the old URL ends on a related page with a 200 (404 or unrelated is 0)   |
| text      | the normalized article text is identical                                |
| headings  | every production heading is present, exactly                            |
| code      | every production code block is present, exactly                         |
| images    | every production image is present                                       |
| links     | every production internal link is present and returns 200 on the target |

Normalization only removes styling noise (whitespace, quote styles, default callout labels, glossary
popover text). The rules and their tests are in `scripts/lib/parity/normalize.ts`.

- **overall**: the weighted mean of the content parameters (`WEIGHTS` in
  `scripts/lib/parity/health.ts`), and 0 when the page does not resolve.
- **triage**: a page is listed when any single parameter is below the threshold (default 0.97).
- **health**: the mean overall score of all pages, times 100, plus the same per section.

## Run it

Needs Node 22 and a built target. Nothing here runs in CI.

```bash
pnpm install && pnpm build && pnpm start -p 3940   # in another terminal
pnpm parity --target http://localhost:3940 --label fumadocs --publish
```

The first run takes a few minutes. Reruns take seconds because pages are cached in `.parity/`
(pass `--no-cache` to refetch). The run writes `.parity/report.md`. With `--publish` it also writes
`public/parity/runs/<label>.json` and updates `public/parity/runs/index.json`.

Other flags: `--prod URL`, `--bypass TOKEN` (Vercel protection bypass, to run against a preview
instead of a local build), `--threshold 0.97`, `--only /path/a,/path/b`, `--commit SHA`,
`--prs 3601,3612`.

## Health after some PRs ship

Merge the PRs you want to measure into a throwaway branch, build it, and publish it under its own
label:

```bash
# in a separate worktree, so this branch's files stay put
git worktree add ../docs-with-prs origin/fumadocs && cd ../docs-with-prs
for n in 3601 3612; do git fetch origin pull/$n/head && git merge --no-edit FETCH_HEAD; done
pnpm install && pnpm build && pnpm start -p 3940
# back in the dewansh/parity-check worktree:
pnpm parity --target http://localhost:3940 --label fumadocs+3601+3612 --prs 3601,3612 --publish
```

Resolve merge conflicts only enough to build. Record them in the PR comments, not here.

## Publish for everyone

Commit only `public/parity/runs/` and push to this branch. Vercel redeploys the preview. In the
dashboard, pick the run, and pick another run under "compare to" to see the health change and the
per-page delta.

```bash
git add public/parity/runs && git commit -m "Parity run <label>" && git push
```

## Notes for agents

- Do not change `scripts/lib/parity/` to hide a real text change. Add a normalizer rule only for
  markup or styling noise, with a test.
- `pnpm test` covers the normalizer and scoring and runs without the network.
- A page listed for triage is a question, not a verdict. Intentional rewrites, content ported from
  `master`, and merged pages all show up. Note the decision in the PR, not in the JSON.
- Never merge this branch.
