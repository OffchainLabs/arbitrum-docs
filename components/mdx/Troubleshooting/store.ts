'use client';

import { useSyncExternalStore } from 'react';

/**
 * Shared state for the node troubleshooting page (ported from the Docusaurus
 * MultiDimensionalContentWidget + GenerateTroubleshootingReportWidget).
 *
 * The original pair of widgets communicated through the DOM: one read which tab carried
 * Docusaurus' `--active` class and stashed the answer in `data-selected-*` attributes, the other
 * read those attributes back when generating the report. That needed `setTimeout` to race the
 * renderer. Here the selection is just state, so the config selector, the per-config guidance, the
 * checklist, and the report generator all read the same snapshot with no DOM coupling.
 *
 * A module-level store (rather than context) keeps MDX authoring simple: components can be dropped
 * anywhere on the page without wrapping the whole document in a provider.
 */

export interface Option {
  id: string;
  label: string;
}

export const OS_OPTIONS: Option[] = [
  { id: 'linux', label: 'Linux, MacOS, Arm64' },
  { id: 'win', label: 'Windows' },
];

export const NETWORK_OPTIONS: Option[] = [
  { id: 'arb-one-nitro', label: 'Arbitrum One (Nitro)' },
  { id: 'arb-one-classic', label: 'Arbitrum One (Classic)' },
  { id: 'arb-nova', label: 'Arbitrum Nova' },
  { id: 'arb-sepolia', label: 'Arbitrum Sepolia' },
  { id: 'localhost', label: 'Localhost' },
];

export const NODE_TYPE_OPTIONS: Option[] = [
  { id: 'full-node', label: 'Full node' },
  { id: 'archive-node', label: 'Archive node' },
  { id: 'validator-node', label: 'Validator node' },
];

export interface TroubleshootingState {
  os: string;
  network: string;
  nodeType: string;
  /** Checklist item id -> checked. */
  checklist: Record<string, boolean>;
  /** Label text per checklist id, registered at render so the report can name each item. */
  labels: Record<string, string>;
}

const STORAGE_KEY = 'arbitrum-docs:troubleshooting-config';

const DEFAULT_STATE: TroubleshootingState = {
  os: OS_OPTIONS[0]!.id,
  network: NETWORK_OPTIONS[0]!.id,
  nodeType: NODE_TYPE_OPTIONS[0]!.id,
  checklist: {},
  labels: {},
};

// `useSyncExternalStore` compares snapshots by reference, so this must be replaced, never mutated.
let state: TroubleshootingState = DEFAULT_STATE;
let hydrated = false;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function persist(): void {
  try {
    const { os, network, nodeType } = state;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ os, network, nodeType }));
  } catch {
    // Private browsing or a full quota: the selection still works for this page view.
  }
}

/**
 * Restore the persisted config on first subscribe.
 *
 * Reading localStorage during render would make the server and client snapshots disagree and
 * trigger a hydration mismatch, so this runs on subscribe (after hydration) and then notifies.
 */
function hydrate(): boolean {
  if (hydrated) return false;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw) as Partial<TroubleshootingState>;
    // Ignore ids that no longer exist, so a renamed option cannot wedge the page on a dead value.
    const os = OS_OPTIONS.some((o) => o.id === saved.os) ? saved.os! : state.os;
    const network = NETWORK_OPTIONS.some((o) => o.id === saved.network)
      ? saved.network!
      : state.network;
    const nodeType = NODE_TYPE_OPTIONS.some((o) => o.id === saved.nodeType)
      ? saved.nodeType!
      : state.nodeType;
    const next = { ...state, os, network, nodeType };
    const changed =
      next.os !== state.os || next.network !== state.network || next.nodeType !== state.nodeType;
    state = next;
    return changed;
  } catch {
    // Corrupt value: fall back to defaults rather than breaking the page.
    return false;
  }
}

function subscribe(listener: () => void): () => void {
  const changed = hydrate();
  listeners.add(listener);
  // Only notify when the restored config actually differs from the server-rendered defaults.
  if (changed) emit();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): TroubleshootingState {
  return state;
}

function getServerSnapshot(): TroubleshootingState {
  return DEFAULT_STATE;
}

export function useTroubleshooting(): TroubleshootingState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setDimension(dimension: 'os' | 'network' | 'nodeType', value: string): void {
  if (state[dimension] === value) return;
  state = { ...state, [dimension]: value };
  persist();
  emit();
}

export function toggleChecklistItem(id: string): void {
  state = { ...state, checklist: { ...state.checklist, [id]: !state.checklist[id] } };
  emit();
}

/** Register a checklist item's label so the generated report can name it. */
export function registerChecklistLabel(id: string, label: string): void {
  if (state.labels[id] === label) return;
  state = { ...state, labels: { ...state.labels, [id]: label } };
  emit();
}

export function labelOf(options: Option[], id: string): string {
  return options.find((o) => o.id === id)?.label ?? id;
}
