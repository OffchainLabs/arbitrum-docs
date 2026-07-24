import { ManifestData, TransitionConfig } from '../types';

const DEFAULT_ZOOM = { level: 4, duration: 1600 };
const DEFAULT_PAUSE = { duration: 200 };
const DEFAULT_FADE = { duration: 1500, easing: 'easeInOut' };

function parseFloat2(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

function parseTransition(el: Element, diagrams: Map<string, string>): TransitionConfig | null {
  const from = el.getAttribute('from') ?? '';
  const to = el.getAttribute('to') ?? '';
  const trigger = el.getAttribute('trigger') ?? '';
  const fromFile = diagrams.get(from) ?? '';
  const targetFile = diagrams.get(to) ?? '';

  if (!from || !to || !trigger || !fromFile || !targetFile) return null;

  const zoomEl = el.querySelector('zoom');
  const pauseEl = el.querySelector('pause');
  const fadeEl = el.querySelector('fade');

  const rawMode = el.getAttribute('mode');
  const mode: TransitionConfig['mode'] = rawMode === 'modal' ? 'modal' : 'zoom';

  return {
    fromFile,
    trigger,
    targetDiagram: to,
    targetFile,
    mode,
    zoom: {
      level: parseFloat2(zoomEl?.getAttribute('level') ?? null, DEFAULT_ZOOM.level),
      duration: parseFloat2(zoomEl?.getAttribute('duration') ?? null, DEFAULT_ZOOM.duration),
    },
    pause: {
      duration: parseFloat2(pauseEl?.getAttribute('duration') ?? null, DEFAULT_PAUSE.duration),
    },
    fade: {
      duration: parseFloat2(fadeEl?.getAttribute('duration') ?? null, DEFAULT_FADE.duration),
      easing: fadeEl?.getAttribute('easing') ?? DEFAULT_FADE.easing,
    },
  };
}

export async function fetchAndParseManifest(manifestUrl: string): Promise<ManifestData> {
  const response = await fetch(manifestUrl);
  if (!response.ok) {
    throw new Error(`Failed to load manifest: ${manifestUrl} (${response.status})`);
  }

  const xmlString = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(`Invalid manifest XML: ${parserError.textContent}`);
  }

  const root = doc.documentElement;
  const id = root.getAttribute('id') ?? '';
  const title = root.getAttribute('title') ?? '';
  const entryDiagramId = root.getAttribute('entryDiagram') ?? '';

  const diagrams = new Map<string, string>();
  for (const el of Array.from(root.querySelectorAll('diagram'))) {
    const diagId = el.getAttribute('id') ?? '';
    const file = el.getAttribute('file') ?? '';
    if (diagId && file) diagrams.set(diagId, file);
  }

  const entryDiagramFile = diagrams.get(entryDiagramId) ?? '';
  if (!entryDiagramFile) {
    throw new Error(`entryDiagram "${entryDiagramId}" not found in manifest diagrams`);
  }

  const transitions: TransitionConfig[] = [];
  for (const el of Array.from(root.querySelectorAll('transition'))) {
    const config = parseTransition(el, diagrams);
    if (config) transitions.push(config);
  }

  return { id, title, entryDiagramFile, diagrams, transitions };
}
