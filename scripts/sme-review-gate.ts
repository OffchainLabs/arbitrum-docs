#!/usr/bin/env tsx
/**
 * SME review gate — Phase 0 (report-only).
 *
 * Decides which subject-matter-expert (SME) teams a PR requires, then checks
 * whether each required team has an approving review. A team is required when:
 *   1. Region markers — a changed line falls inside an MDX block wrapped in
 *      `{/​* sme:start team=<slug> *​/}` … `{/​* sme:end *​/}`.
 *   2. Path fallback — a changed file matches one of the team's configured globs
 *      (so untagged technical edits still gate).
 *
 * Result is published as a `sme-review-gate` check run. In report-only mode
 * (`reportOnly: true` in config) the conclusion is always `neutral` so it never
 * blocks a merge; flipping `reportOnly` to false makes it pass/fail (Phase 1).
 *
 * Config: .github/sme-config.json
 * Auth:   gh CLI (GH_TOKEN). Reading org team membership needs `members:read`;
 *         without it a team is reported "unverifiable" rather than failing.
 *
 * Usage:  yarn tsx scripts/sme-review-gate.ts --pr <number>
 *         (PR number also read from $PR_NUMBER or $GITHUB_REF refs/pull/N/merge)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, appendFileSync } from 'node:fs';
import path from 'node:path';

interface SmeConfig {
  org: string;
  editorialTeam: string;
  reportOnly: boolean;
  smeTeams: Record<string, string[]>;
}

interface Region {
  team: string;
  start: number;
  end: number;
}

const REPO = process.env.GITHUB_REPOSITORY ?? 'OffchainLabs/arbitrum-docs';
const ROOT = process.cwd();

/** Run a `gh` subcommand with an argv array (no shell), returning stdout text. */
function gh(args: string[]): string {
  return execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function ghJson<T>(args: string[]): T {
  return JSON.parse(gh(args)) as T;
}

function loadConfig(): SmeConfig {
  const raw = readFileSync(path.join(ROOT, '.github/sme-config.json'), 'utf8');
  return JSON.parse(raw) as SmeConfig;
}

function resolvePrNumber(): number {
  const flagIdx = process.argv.indexOf('--pr');
  const fromFlag = flagIdx >= 0 ? process.argv[flagIdx + 1] : undefined;
  const fromEnv = process.env.PR_NUMBER;
  const fromRef = process.env.GITHUB_REF?.match(/refs\/pull\/(\d+)\//)?.[1];
  const value = fromFlag ?? fromEnv ?? fromRef;
  if (!value) throw new Error('PR number not provided (use --pr, $PR_NUMBER, or $GITHUB_REF)');
  return Number(value);
}

/** `docs/foo/**` matches `docs/foo` and anything under it; otherwise exact match. */
function matchesGlob(file: string, pattern: string): boolean {
  if (pattern.endsWith('/**')) {
    const prefix = pattern.slice(0, -3);
    return file === prefix || file.startsWith(`${prefix}/`);
  }
  return file === pattern;
}

/** Parse a unified-diff patch into the set of added/modified new-file line numbers. */
function changedLines(patch: string | undefined): Set<number> {
  const lines = new Set<number>();
  if (!patch) return lines;
  let newLine = 0;
  for (const ln of patch.split('\n')) {
    const hunk = ln.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) {
      newLine = Number(hunk[1]);
      continue;
    }
    if (ln.startsWith('\\')) continue; // "\ No newline at end of file"
    if (ln.startsWith('+') && !ln.startsWith('+++')) {
      lines.add(newLine);
      newLine++;
    } else if (ln.startsWith('-') && !ln.startsWith('---')) {
      // deleted line — no corresponding new-file line
    } else {
      newLine++; // context line
    }
  }
  return lines;
}

const START_RE = /\{\/\*\s*sme:start\s+team=([A-Za-z0-9._-]+)/;
const END_RE = /\{\/\*\s*sme:end\b/;

/** Find `sme:start … sme:end` regions (1-based, inclusive) in a checked-out file. */
function regionsInFile(file: string): Region[] {
  const abs = path.join(ROOT, file);
  if (!existsSync(abs)) return [];
  const text = readFileSync(abs, 'utf8').split('\n');
  const regions: Region[] = [];
  let open: { team: string; start: number } | null = null;
  for (let i = 0; i < text.length; i++) {
    const lineNo = i + 1;
    const startMatch = text[i].match(START_RE);
    if (startMatch) {
      open = { team: startMatch[1], start: lineNo };
      continue;
    }
    if (open && END_RE.test(text[i])) {
      regions.push({ team: open.team, start: open.start, end: lineNo });
      open = null;
    }
  }
  if (open) regions.push({ team: open.team, start: open.start, end: text.length });
  return regions;
}

interface ChangedFile {
  filename: string;
  patch?: string;
}

/** Map each required SME team to the reasons (files/regions) that triggered it. */
function requiredTeams(config: SmeConfig, files: ChangedFile[]): Map<string, Set<string>> {
  const required = new Map<string, Set<string>>();
  const add = (team: string, reason: string) => {
    if (!config.smeTeams[team]) return; // unknown team slug — ignore
    let set = required.get(team);
    if (!set) {
      set = new Set();
      required.set(team, set);
    }
    set.add(reason);
  };
  for (const f of files) {
    const lines = changedLines(f.patch);
    for (const region of regionsInFile(f.filename)) {
      if ([...lines].some((l) => l >= region.start && l <= region.end)) {
        add(region.team, `${f.filename} (region L${region.start}-${region.end})`);
      }
    }
    for (const [team, globs] of Object.entries(config.smeTeams)) {
      if (globs.some((g) => matchesGlob(f.filename, g))) add(team, `${f.filename} (path)`);
    }
  }
  return required;
}

/** Lint SME markers in changed files: unbalanced start/end and unknown team slugs. */
function markerIssues(config: SmeConfig, files: ChangedFile[]): string[] {
  const issues: string[] = [];
  for (const f of files) {
    const abs = path.join(ROOT, f.filename);
    if (!existsSync(abs)) continue;
    const text = readFileSync(abs, 'utf8').split('\n');
    let openTeam: string | null = null;
    let openLine = 0;
    for (let i = 0; i < text.length; i++) {
      const startMatch = text[i].match(START_RE);
      if (startMatch) {
        if (openTeam) issues.push(`${f.filename}:${openLine} sme:start (team=${openTeam}) reopened before sme:end`);
        openTeam = startMatch[1];
        openLine = i + 1;
        if (!config.smeTeams[startMatch[1]]) {
          issues.push(`${f.filename}:${i + 1} unknown SME team '${startMatch[1]}' (not in .github/sme-config.json)`);
        }
      } else if (END_RE.test(text[i])) {
        if (!openTeam) issues.push(`${f.filename}:${i + 1} sme:end with no matching sme:start`);
        openTeam = null;
      }
    }
    if (openTeam) issues.push(`${f.filename}:${openLine} sme:start (team=${openTeam}) never closed`);
  }
  return issues;
}

interface Review {
  user: { login: string } | null;
  state: string;
  submitted_at: string;
}

/** Logins whose most recent decisive review (APPROVED/CHANGES_REQUESTED/DISMISSED) is APPROVED. */
function approvers(pr: number): Set<string> {
  const reviews = ghJson<Review[]>(['api', `repos/${REPO}/pulls/${pr}/reviews`, '--paginate']);
  const latest = new Map<string, string>();
  for (const r of reviews) {
    const login = r.user?.login;
    if (!login || !['APPROVED', 'CHANGES_REQUESTED', 'DISMISSED'].includes(r.state)) continue;
    latest.set(login, r.state); // reviews come in chronological order
  }
  return new Set([...latest].filter(([, state]) => state === 'APPROVED').map(([login]) => login));
}

/** Team member logins, or null if membership can't be read (missing `members:read`). */
function teamMembers(org: string, team: string): Set<string> | null {
  try {
    const members = ghJson<{ login: string }[]>([
      'api',
      `orgs/${org}/teams/${team}/members`,
      '--paginate',
    ]);
    return new Set(members.map((m) => m.login));
  } catch {
    return null;
  }
}

interface TeamVerdict {
  team: string;
  satisfied: boolean;
  unverifiable: boolean;
  reasons: string[];
}

function evaluateTeams(
  teams: Map<string, Set<string>>,
  org: string,
  approved: Set<string>,
): TeamVerdict[] {
  return [...teams].map(([team, reasons]) => {
    const members = teamMembers(org, team);
    return {
      team,
      reasons: [...reasons],
      unverifiable: members === null,
      satisfied: members !== null && [...members].some((m) => approved.has(m)),
    };
  });
}

function buildSummary(
  verdicts: TeamVerdict[],
  editorial: { satisfied: boolean; unverifiable: boolean },
  issues: string[],
  reportOnly: boolean,
): { title: string; body: string } {
  const mode = reportOnly ? 'report-only — not blocking' : 'enforcing';
  const issueBlock =
    issues.length === 0 ? [] : ['', '**Marker problems (fix these):**', ...issues.map((i) => `- ${i}`)];

  if (verdicts.length === 0) {
    return {
      title: issues.length ? 'Fix SME marker problems' : 'No SME-tagged content changed',
      body: [
        `**SME gate** (${mode})`,
        '',
        'This PR touches no SME-required regions or paths — editorial (TW) approval alone is sufficient.',
        ...issueBlock,
      ].join('\n'),
    };
  }

  const rows = verdicts.map((v) => {
    const mark = v.unverifiable ? '❓ unverifiable' : v.satisfied ? '✅ approved' : '⛔ awaiting';
    return `| \`${v.team}\` | ${mark} | ${v.reasons.join('; ')} |`;
  });
  const pending = verdicts.filter((v) => !v.satisfied && !v.unverifiable);
  const unresolved = verdicts.filter((v) => v.unverifiable);
  const edit = editorial.unverifiable
    ? '❓ editorial membership unverifiable'
    : editorial.satisfied
      ? '✅ editorial (TW) approved'
      : '⛔ editorial (TW) approval pending';

  let title: string;
  if (issues.length) title = 'Fix SME marker problems';
  else if (unresolved.length) title = `Cannot verify ${unresolved.length} SME team(s) — gate misconfigured`;
  else if (pending.length) title = `Awaiting ${pending.length} SME team(s)`;
  else title = 'All required SME teams approved';

  const notes = unresolved.length
    ? ['', '> ❓ **unverifiable** = the gate could not read this team\'s membership. It likely does not exist yet or the token lacks `members:read`. See `.github/SME_REVIEW_GATE.md`.']
    : [];

  return {
    title,
    body: [
      `**SME gate** (${mode})`,
      '',
      '| SME team | Status | Triggered by |',
      '| --- | --- | --- |',
      ...rows,
      ...notes,
      '',
      `${edit} — _editorial gate is enforced by the branch ruleset, shown here for context._`,
      ...issueBlock,
    ].join('\n'),
  };
}

function publishCheck(headSha: string, conclusion: string, title: string, body: string): void {
  if (process.env.GITHUB_ACTIONS !== 'true') return; // local dry-run: stdout only
  try {
    gh([
      'api',
      '-X',
      'POST',
      `repos/${REPO}/check-runs`,
      '-f',
      'name=sme-review-gate',
      '-f',
      `head_sha=${headSha}`,
      '-f',
      'status=completed',
      '-f',
      `conclusion=${conclusion}`,
      '-f',
      `output[title]=${title}`,
      '-f',
      `output[summary]=${body}`,
    ]);
  } catch (err) {
    console.error(`Could not publish check run (needs checks:write): ${(err as Error).message}`);
  }
}

function main(): void {
  const config = loadConfig();
  const pr = resolvePrNumber();
  const prData = ghJson<{ head: { sha: string }; merged: boolean }>([
    'api',
    `repos/${REPO}/pulls/${pr}`,
  ]);
  const files = ghJson<ChangedFile[]>(['api', `repos/${REPO}/pulls/${pr}/files`, '--paginate']);

  const required = requiredTeams(config, files);
  const approved = approvers(pr);
  const verdicts = evaluateTeams(required, config.org, approved);
  const issues = markerIssues(config, files);

  const editorialMembers = teamMembers(config.org, config.editorialTeam);
  const editorial = {
    unverifiable: editorialMembers === null,
    satisfied: editorialMembers !== null && [...editorialMembers].some((m) => approved.has(m)),
  };

  const { title, body } = buildSummary(verdicts, editorial, issues, config.reportOnly);
  const misconfigured = issues.length > 0 || verdicts.some((v) => v.unverifiable);
  const pending = verdicts.some((v) => !v.satisfied && !v.unverifiable);
  // report-only never blocks; otherwise setup/marker problems need action, missing approvals fail.
  const conclusion = config.reportOnly
    ? 'neutral'
    : misconfigured
      ? 'action_required'
      : pending
        ? 'failure'
        : 'success';

  console.log(`sme-review-gate: ${title} (conclusion=${conclusion})`);
  console.log(body);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## SME review gate\n\n${body}\n`);
  }
  publishCheck(prData.head.sha, conclusion, title, body);
}

main();
