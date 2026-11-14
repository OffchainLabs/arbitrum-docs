import type { ActorKind, Chain, Finality } from './model.ts';

// Brand palette and measured text colors: .claude/skills/arbitrum-brand-svg-diagrams/SKILL.md
export const BRAND = {
  gradient: 'linear-gradient(180deg, #152c4e 0%, #1b4add 55%, #12aaff 100%)',
  connector: '#9dcced',
  active: '#eaf5ff',
  activeGlow: '0 0 0 5px rgba(18, 170, 255, 0.45)',
  chip: '#152c4e',
  chipText: '#eaf5ff',
  font: "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  dimmed: 0.35,
};

export const KIND_STYLE: Record<
  ActorKind,
  { fill: string; title: string; sub: string; key: string }
> = {
  process: { fill: '#213147', title: '#ffffff', sub: '#c9dcef', key: 'Nitro process' },
  contract: { fill: '#e6007a', title: '#ffffff', sub: '#ffffff', key: 'Parent chain contract' },
  user: { fill: '#12aaff', title: '#0b1b2e', sub: '#0b2438', key: 'User' },
};

// Each pair is [inactive, active]. Ink tint on the child chain: no fill tint reaches 3:1 against
// the gradient, so the solid border marks the band edge.
export const BAND_STYLE: Record<
  'child' | 'parent',
  { name: string; accent: string; fill: [string, string]; border: [string, string] }
> = {
  child: {
    name: 'Child chain · Arbitrum One',
    accent: '#9dcced',
    fill: ['rgba(11, 27, 46, 0.3)', 'rgba(11, 27, 46, 0.45)'],
    border: ['#9dcced', '#eaf5ff'],
  },
  parent: {
    name: 'Parent chain · Ethereum',
    accent: '#e6007a',
    fill: ['rgba(230, 0, 122, 0.10)', 'rgba(230, 0, 122, 0.22)'],
    border: ['rgba(230, 0, 122, 0.5)', 'rgba(255, 120, 190, 0.95)'],
  },
};

export const CHAIN_LABEL: Record<Chain, string> = {
  'child': 'child chain',
  'parent': 'parent chain',
  'off-chain': 'off-chain',
};

export const FINALITY_LABEL: Record<Finality, string> = {
  'soft': 'Soft finality',
  'batch-posted': 'Batch posted on parent chain',
};
