const STEP_HASH_PATTERN = /^#step-(\d+)$/;

export function clampStep(index: number, stepCount: number): number {
  return Math.min(Math.max(index, 0), stepCount - 1);
}

export function parseStepHash(hash: string, stepCount: number): number | null {
  const match = STEP_HASH_PATTERN.exec(hash);
  if (match === null) return null;
  return clampStep(Number(match[1]) - 1, stepCount);
}

export function stepHash(index: number): string {
  return `#step-${index + 1}`;
}
