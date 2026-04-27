export type WalkthroughStep = {
  id: string;
  title: string;
  body: string;
  startLine: number;
  endLine: number;
};

export type ParsedWalkthrough = {
  code: string;
  steps: WalkthroughStep[];
};

type OpenStep = Omit<WalkthroughStep, 'endLine'> & {
  bodyLines: string[];
};

const markerPattern =
  /^\s*(?:(?:\/\/|#)\s*walkthrough-step\s+([\w-]+)\s+"([^"]+)"|<!--\s*walkthrough-step\s+([\w-]+)\s+"([^"]+)"\s*-->)\s*$/;

function stripComment(line: string): string | null {
  const slashComment = line.match(/^\s*\/\/\s?(.*)$/);
  if (slashComment) return slashComment[1] ?? '';

  const hashComment = line.match(/^\s*#\s?(.*)$/);
  if (hashComment) return hashComment[1] ?? '';

  const htmlComment = line.match(/^\s*<!--\s?(.*?)\s?-->\s*$/);
  if (htmlComment) return htmlComment[1] ?? '';

  return null;
}

function finalizeStep(openStep: OpenStep | null, lastLine: number): WalkthroughStep | null {
  if (!openStep) return null;

  return {
    id: openStep.id,
    title: openStep.title,
    body: openStep.bodyLines.join('\n').trim(),
    startLine: openStep.startLine,
    endLine: Math.max(openStep.startLine, lastLine),
  };
}

export function parseCodeWalkthrough(source: string): ParsedWalkthrough {
  const sourceLines = source.replace(/\n$/, '').split('\n');
  const codeLines: string[] = [];
  const steps: WalkthroughStep[] = [];
  let openStep: OpenStep | null = null;
  let collectingBody = false;

  sourceLines.forEach((line) => {
    const marker = line.match(markerPattern);

    if (marker) {
      const previous = finalizeStep(openStep, codeLines.length);
      if (previous) steps.push(previous);

      openStep = {
        id: marker[1] || marker[3],
        title: marker[2] || marker[4],
        body: '',
        bodyLines: [],
        startLine: codeLines.length + 1,
      };
      collectingBody = true;
      return;
    }

    if (openStep && collectingBody) {
      const comment = stripComment(line);
      if (comment !== null) {
        openStep.bodyLines.push(comment);
        return;
      }

      if (line.trim() === '') {
        openStep.bodyLines.push('');
        return;
      }

      collectingBody = false;
      openStep.startLine = codeLines.length + 1;
    }

    codeLines.push(line);
  });

  const last = finalizeStep(openStep, codeLines.length);
  if (last) steps.push(last);

  return {
    code: codeLines.join('\n'),
    steps,
  };
}

export function metastringHasWalkthrough(metastring?: string): boolean {
  return Boolean(metastring && /(^|\s)walkthrough(\s|$)/.test(metastring));
}

export function parseCodeTitle(metastring?: string, fallback?: string): string | undefined {
  if (!metastring) return fallback;
  const quoted = metastring.match(/title="([^"]+)"/);
  if (quoted) return quoted[1];
  const bare = metastring.match(/title=([^\s]+)/);
  return bare?.[1] ?? fallback;
}
