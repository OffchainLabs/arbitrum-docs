/**
 * remote-images-check — find images that are loaded from somebody else's server.
 *
 * Two modes, because there are two different problems.
 *
 * **`--presence`. Offline, deterministic, and a blocking gate.** A markdown image with a remote src
 * (`![alt](https://…)`) 500s the page it is on. It resolves to `next/image`, and since
 * `source.config.ts` sets `remarkImageOptions.external: false` nothing measures it at build, so Next
 * throws `Image with src "…" is missing required "width" property` at render. `types:check` cannot
 * see that and no other gate requests the page. This mode fails on exactly that, touches no network,
 * and therefore belongs in CI.
 *
 * **Default. Network reachability, report only.** Requests every remote image, markdown or JSX, and
 * lists the ones that no longer answer. Deliberately not in CI: a third party's outage is not a
 * reason to fail somebody else's pull request. Exits 0 unless `--strict`.
 *
 * A remote src is fine through `<ImageZoom src="https://…">`, which renders a plain `<img>`. Rot is
 * still the risk there, so the network mode covers it and `--presence` leaves it alone.
 *
 * Usage:
 *   pnpm images:check                # network report, always exits 0
 *   pnpm images:check --strict       # network report, exits 1 on anything unreachable
 *   pnpm images:presence             # offline, exits 1 on a remote markdown image
 *   pnpm images:check --json         # machine-readable, exits 0
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { type RemoteImage, extractRemoteImages, isReachable } from './lib/remote-images.ts';

/** Anchored on this file, not on cwd: running from a subdirectory used to report a false clean. */
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CONTENT_DIRS = ['content/docs', 'content/partials', 'content/glossary', 'content/_versions'];
const TIMEOUT_MS = 15_000;
const CONCURRENCY = 8;

/**
 * The outcome of one probe: an HTTP answer and the method that got it, or the reason no answer
 * came back.
 */
type ProbeResult =
  | { status: number; method: string; error?: undefined }
  | { error: string; status?: undefined; method?: undefined };

/** One line of either report: where the image is, its URL, and what is wrong with it. */
interface ReportEntry {
  file: string;
  line: number;
  url: string;
  detail: string;
}

/** A user agent that looks like a browser: several image hosts serve 403 to anything else. */
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && full.endsWith('.mdx') ? [full] : [];
  });
}

function collect(): Map<string, RemoteImage[]> {
  const byFile = new Map<string, RemoteImage[]>();

  for (const dir of CONTENT_DIRS) {
    for (const file of walk(path.join(REPO_ROOT, dir))) {
      const images = extractRemoteImages(fs.readFileSync(file, 'utf8'));
      if (images.length > 0) byFile.set(path.relative(REPO_ROOT, file), images);
    }
  }

  return byFile;
}

/**
 * HEAD the URL, falling back to GET when the host refuses HEAD.
 *
 * Returns `{ status }` on any HTTP answer and `{ error }` when the request never completed.
 */
async function probe(url: string): Promise<ProbeResult> {
  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        headers: { 'user-agent': USER_AGENT, 'accept': 'image/*,*/*' },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      // A HEAD that is refused or unimplemented says nothing about the image itself.
      if (method === 'HEAD' && [403, 405, 501].includes(response.status)) continue;
      return { status: response.status, method };
    } catch (error) {
      if (method === 'GET') {
        return { error: (error instanceof Error ? error.message : undefined) ?? String(error) };
      }
    }
  }

  return { error: 'no response' };
}

async function probeAll(urls: readonly string[]): Promise<Map<string, ProbeResult>> {
  const results = new Map<string, ProbeResult>();
  const queue = [...urls];

  const worker = async () => {
    for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
      results.set(url, await probe(url));
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
  return results;
}

function describe(result: ProbeResult): string {
  if (result.error) return `request failed: ${result.error}`;

  // 403 is the one status a human has to interpret rather than act on. It arrives here only after
  // a GET with a browser user agent, so it does not distinguish "the image is gone" from "the host
  // refuses automated clients" — and this mode is advisory precisely so a person makes that call.
  if (result.status === 403) {
    return `HTTP 403 (${result.method}) — gone, or the host blocks automation; open it in a browser`;
  }

  return `HTTP ${result.status} (${result.method})`;
}

function report(
  entries: readonly ReportEntry[],
  heading: string,
  log: (line: string) => void,
): void {
  log(`\n${heading}`);
  let current: string | null = null;
  for (const entry of entries) {
    if (entry.file !== current) {
      current = entry.file;
      log(`  ${current}`);
    }
    log(`    line ${entry.line}: ${entry.detail}`);
    log(`      ${entry.url}`);
  }
}

/** Offline gate: a remote markdown image is a 500 waiting to happen. */
function presence(byFile: Map<string, RemoteImage[]>, json: boolean): void {
  const offenders: ReportEntry[] = [];

  for (const [file, images] of byFile) {
    for (const image of images) {
      if (image.syntax !== 'markdown') continue;
      offenders.push({ file, line: image.line, url: image.url, detail: 'remote markdown image' });
    }
  }

  if (json) {
    console.log(JSON.stringify({ offenders }, null, 2));
    return;
  }

  if (offenders.length === 0) {
    console.log('remote-images-check --presence: no remote markdown images.');
    return;
  }

  console.error(
    `remote-images-check --presence: ${offenders.length} remote markdown image(s). Each renders as an HTTP 500.`,
  );
  console.error(
    'next/image needs a width and the build no longer measures remote images. Copy the file into public/img/ and use /img/…, or embed it with <ImageZoom src="https://…" />.',
  );
  report(offenders, 'Offending images:', console.error);
  process.exitCode = 1;
}

async function reachability(
  byFile: Map<string, RemoteImage[]>,
  { json, strict }: { json: boolean; strict: boolean },
): Promise<void> {
  const urls = [...new Set([...byFile.values()].flat().map((image) => image.url))];

  if (urls.length === 0) {
    if (json) console.log(JSON.stringify({ images: 0, unreachable: [] }));
    else console.log('remote-images-check: no remote images in content. Nothing to rot.');
    return;
  }

  const results = await probeAll(urls);
  const unreachable: ReportEntry[] = [];

  for (const [file, images] of byFile) {
    for (const image of images) {
      // Every URL was probed above, so a miss is impossible; if one happens, fail as loudly as the
      // untyped version did when it read `.status` off `undefined`.
      const result = results.get(image.url);
      if (!result) throw new Error(`remote-images-check: no probe result for ${image.url}`);
      if (!isReachable(result.status)) {
        unreachable.push({ file, line: image.line, url: image.url, detail: describe(result) });
      }
    }
  }

  if (json) {
    console.log(JSON.stringify({ images: urls.length, unreachable }, null, 2));
    return;
  }

  console.log(
    `remote-images-check: ${urls.length} remote image URL(s) across ${byFile.size} file(s).`,
  );

  if (unreachable.length === 0) {
    console.log('All of them answered. None is unreachable.');
    return;
  }

  report(unreachable, `${unreachable.length} unreachable:`, console.log);
  if (strict) process.exitCode = 1;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const json = args.includes('--json');
  const byFile = collect();

  if (args.includes('--presence')) {
    presence(byFile, json);
    return;
  }

  await reachability(byFile, { json, strict: args.includes('--strict') });
}

await main();
