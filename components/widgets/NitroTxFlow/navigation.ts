const STEP_HASH_PATTERN = /^#(?:(.+)-)?step-(\d+)$/;

export interface PathCount {
  id: string;
  stepCount: number;
}

export interface StepPosition {
  path: number;
  index: number;
}

export function clampStep(index: number, stepCount: number): number {
  return Math.min(Math.max(index, 0), stepCount - 1);
}

export function parseStepHash(hash: string, paths: PathCount[]): StepPosition | null {
  const match = STEP_HASH_PATTERN.exec(hash);
  if (match === null) return null;
  const path = paths.findIndex((candidate) => candidate.id === (match[1] ?? ''));
  const found = paths[path];
  if (found === undefined) return null;
  return { path, index: clampStep(Number(match[2]) - 1, found.stepCount) };
}

export function stepHash(position: StepPosition, paths: PathCount[]): string {
  const id = paths[position.path]?.id ?? '';
  return `#${id === '' ? '' : `${id}-`}step-${position.index + 1}`;
}
