import type {
  DecodedEvent,
  EdgeAddedMeta,
  EdgeState,
  AppliedState,
  RangeNode,
  RangeIndex,
  LevelMeta,
  LevelGroup,
  TreeNode,
} from './types';

// ── Utility formatters ──────────────────────────────────────────

export const normalizeHex = (value: string | null | undefined): string =>
  `0x${String(value || '')
    .replace(/^0x/, '')
    .toLowerCase()}`;

export const shortHex = (value: string | null | undefined, lead = 6, tail = 4): string => {
  const hex = normalizeHex(value);
  if (hex.length <= 2 + lead + tail) return hex;
  return `${hex.slice(0, 2 + lead)}\u2026${hex.slice(-tail)}`;
};

export const toBigInt = (value: string | number | null | undefined): bigint | null => {
  if (value == null || value === '-') return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
};

export function formatRangeText(startHeight: string | null, endHeight: string | null): string {
  const start = toBigInt(startHeight);
  const end = toBigInt(endHeight);
  if (start == null || end == null) return 'unknown';
  return `${start} \u2192 ${end}`;
}

// ── Bisection math ──────────────────────────────────────────────

export function mostSignificantBitBigInt(x: bigint): number | null {
  if (x <= 0n) return null;
  let msb = -1;
  let cursor = x;
  while (cursor > 0n) {
    cursor >>= 1n;
    msb += 1;
  }
  return msb;
}

export function mandatoryBisectionHeight(start: bigint, end: bigint): bigint {
  const diff = end - start;
  if (diff < 2n) throw new Error('HeightDiffLtTwo');
  if (diff === 2n) return start + 1n;
  const d = (end - 1n) ^ start;
  const msb = mostSignificantBitBigInt(d);
  if (msb == null) throw new Error('ZeroHasNoSignificantBits');
  const mask = -1n << BigInt(msb);
  return (end - 1n) & mask;
}

// ── Structural maps ─────────────────────────────────────────────

export function buildParentMap(allEvents: DecodedEvent[]): Map<string, string> {
  const map = new Map<string, string>();
  allEvents.forEach((ev) => {
    if (ev.type === 'EdgeBisected') {
      if (ev.lowerChildId) map.set(ev.lowerChildId, ev.edgeId);
      if (ev.upperChildId) map.set(ev.upperChildId, ev.edgeId);
    }
  });
  return map;
}

export function buildChildOrderMap(
  allEvents: DecodedEvent[],
): Map<string, { lowerChildId: string; upperChildId: string }> {
  const map = new Map<string, { lowerChildId: string; upperChildId: string }>();
  allEvents.forEach((ev) => {
    if (ev.type === 'EdgeBisected') {
      map.set(ev.edgeId, {
        lowerChildId: ev.lowerChildId,
        upperChildId: ev.upperChildId,
      });
    }
  });
  return map;
}

// ── Derived ranges ──────────────────────────────────────────────

export function recomputeDerivedRanges(
  edgeAddedById: Map<string, EdgeAddedMeta>,
  childOrderByParent: Map<string, { lowerChildId: string; upperChildId: string }>,
): {
  rangeByEdgeId: Map<string, { start: bigint; end: bigint }>;
  rangeKeyByEdgeId: Map<string, string>;
} {
  const rangeByEdgeId = new Map<string, { start: bigint; end: bigint }>();
  const rangeKeyByEdgeId = new Map<string, string>();

  // Seed ranges from layerzero edges
  edgeAddedById.forEach((ev, edgeId) => {
    if (!ev || ev.type !== 'EdgeAdded') return;
    if (ev.isLayerZero !== true) return;
    try {
      const end = BigInt(ev.length);
      rangeByEdgeId.set(normalizeHex(edgeId), { start: 0n, end });
    } catch {
      // ignore
    }
  });

  // Propagate ranges down the bisection tree
  let changed = true;
  let guard = 0;
  while (changed && guard < 2000) {
    changed = false;
    guard += 1;
    childOrderByParent.forEach((order, parentId) => {
      const parentKey = normalizeHex(parentId);
      const parentRange = rangeByEdgeId.get(parentKey);
      if (!parentRange) return;
      const { start, end } = parentRange;
      if (end - start < 2n) return;
      let mid: bigint;
      try {
        mid = mandatoryBisectionHeight(start, end);
      } catch {
        return;
      }
      const lowerId = order?.lowerChildId ? normalizeHex(order.lowerChildId) : null;
      const upperId = order?.upperChildId ? normalizeHex(order.upperChildId) : null;
      if (lowerId && !rangeByEdgeId.has(lowerId)) {
        rangeByEdgeId.set(lowerId, { start, end: mid });
        changed = true;
      }
      if (upperId && !rangeByEdgeId.has(upperId)) {
        rangeByEdgeId.set(upperId, { start: mid, end });
        changed = true;
      }
    });
  }

  // Build stable merge keys
  edgeAddedById.forEach((ev, edgeId) => {
    if (!ev || ev.type !== 'EdgeAdded') return;
    const id = normalizeHex(edgeId);
    const range = rangeByEdgeId.get(id);
    if (!range) return;
    if (!Number.isFinite(ev.level)) return;
    rangeKeyByEdgeId.set(id, `${ev.level}:${range.start.toString()}:${range.end.toString()}`);
  });

  return { rangeByEdgeId, rangeKeyByEdgeId };
}

// ── Level metadata ──────────────────────────────────────────────

export function computeLevelMeta(
  edgeAddedById: Map<string, EdgeAddedMeta>,
  ospEdgeIds: Set<string>,
): LevelMeta {
  let maxLevel: number | null = null;
  edgeAddedById.forEach((ev) => {
    if (ev?.type !== 'EdgeAdded') return;
    if (Number.isFinite(ev.level)) {
      maxLevel = maxLevel == null ? ev.level : Math.max(maxLevel, ev.level);
    }
  });

  let ospLevel: number | null = null;
  ospEdgeIds.forEach((edgeId) => {
    const ev = edgeAddedById.get(normalizeHex(edgeId));
    if (ev?.type !== 'EdgeAdded') return;
    if (Number.isFinite(ev.level)) {
      ospLevel = ospLevel == null ? ev.level : Math.max(ospLevel, ev.level);
    }
  });

  const smallstepLevel = ospLevel != null ? ospLevel : maxLevel;
  return { maxLevel, smallstepLevel };
}

export function resolveLevelType(
  level: number | string | undefined,
  levelMeta: LevelMeta,
): string | null {
  if (!Number.isFinite(level as number)) return null;
  const numLevel = level as number;
  const smallstepLevel = levelMeta?.smallstepLevel ?? levelMeta?.maxLevel;
  if (numLevel === 0) return 'block';
  if (smallstepLevel != null && numLevel === smallstepLevel) return 'smallstep';
  if (smallstepLevel != null && numLevel > 0 && numLevel < smallstepLevel) return 'bigstep';
  return null;
}

// ── Range index ─────────────────────────────────────────────────

export function buildRangeIndex(
  state: AppliedState,
  edgeAddedById: Map<string, EdgeAddedMeta>,
  rangeByEdgeId: Map<string, { start: bigint; end: bigint }>,
  rangeKeyByEdgeId: Map<string, string>,
  childOrderByParent: Map<string, { lowerChildId: string; upperChildId: string }>,
): RangeIndex {
  const rangeNodes = new Map<string, RangeNode>();

  const getRangeKey = (edgeId: string): string | null =>
    rangeKeyByEdgeId.get(normalizeHex(edgeId)) || null;

  const ensureNode = (edge: EdgeState): string | null => {
    const rangeKey = getRangeKey(edge.id);
    if (!rangeKey) return null;
    const edgeId = normalizeHex(edge.id);
    const added = edgeAddedById.get(edgeId);
    const derivedRange = rangeByEdgeId.get(edgeId) || null;
    const derivedStart = derivedRange ? derivedRange.start.toString() : null;
    const derivedEnd = derivedRange ? derivedRange.end.toString() : null;
    const derivedLength =
      derivedRange != null ? (derivedRange.end - derivedRange.start).toString() : null;

    let node = rangeNodes.get(rangeKey);
    if (!node) {
      node = {
        rangeKey,
        level: Number.isFinite(added?.level) ? added!.level : edge.level ?? '-',
        startHeight: derivedStart ?? edge.startHeight ?? null,
        endHeight: derivedEnd ?? edge.endHeight ?? null,
        length: added?.length ?? derivedLength ?? edge.length ?? null,
        edges: [],
        edgeIds: new Set(),
        mutualIds: new Set(),
        hasRival: false,
        bisected: false,
        ospConfirmed: false,
        lowerChildKey: null,
        upperChildKey: null,
        childKeys: new Set(),
      };
      rangeNodes.set(rangeKey, node);
    }

    if (!node.edgeIds.has(edge.id)) {
      node.edgeIds.add(edge.id);
      const edgeHasRival = added?.hasRival === true || edge.hasRival === true;
      node.edges.push({ id: edge.id, hasRival: edgeHasRival });
    }
    if (added?.mutualId) node.mutualIds.add(added.mutualId);
    if (added?.hasRival === true || edge.hasRival === true) node.hasRival = true;
    if (edge.bisected) node.bisected = true;
    if (edge.ospConfirmed) node.ospConfirmed = true;
    if (node.startHeight == null) node.startHeight = edge.startHeight ?? null;
    if (node.endHeight == null) node.endHeight = edge.endHeight ?? null;
    if (node.length == null && edge.length != null) node.length = edge.length;
    if (node.level === '-' && edge.level !== '-') node.level = edge.level;
    return rangeKey;
  };

  state.edges.forEach((edge) => ensureNode(edge));

  state.edges.forEach((edge) => {
    const order = childOrderByParent.get(edge.id);
    if (!order) return;
    const parentKey = ensureNode(edge);
    if (!parentKey) return;
    const parentNode = rangeNodes.get(parentKey);
    if (!parentNode) return;
    const lowerEdge = order.lowerChildId ? state.edges.get(order.lowerChildId) : null;
    const upperEdge = order.upperChildId ? state.edges.get(order.upperChildId) : null;
    const lowerKey = lowerEdge ? ensureNode(lowerEdge) : null;
    const upperKey = upperEdge ? ensureNode(upperEdge) : null;
    if (lowerKey && lowerKey !== parentKey) parentNode.childKeys.add(lowerKey);
    if (upperKey && upperKey !== parentKey) parentNode.childKeys.add(upperKey);
  });

  // Enforce strict lower/upper ordering
  rangeNodes.forEach((node) => {
    if (!Number.isFinite(node.level as number)) return;
    const start = toBigInt(node.startHeight);
    const end = toBigInt(node.endHeight);
    if (start == null || end == null) return;
    if (end - start < 2n) return;
    let mid: bigint;
    try {
      mid = mandatoryBisectionHeight(start, end);
    } catch {
      return;
    }
    const lowerKey = `${node.level}:${start.toString()}:${mid.toString()}`;
    const upperKey = `${node.level}:${mid.toString()}:${end.toString()}`;
    if (node.childKeys.has(lowerKey)) node.lowerChildKey = lowerKey;
    if (node.childKeys.has(upperKey)) node.upperChildKey = upperKey;
  });

  const hasParent = new Set<string>();
  rangeNodes.forEach((node) => {
    node.childKeys.forEach((childKey) => hasParent.add(childKey));
  });
  const rootKeys: string[] = [];
  rangeNodes.forEach((_node, key) => {
    if (!hasParent.has(key)) rootKeys.push(key);
  });

  return { rangeNodes, rootKeys };
}

export function computeRootKeys(rangeNodes: Map<string, RangeNode>): string[] {
  const hasParent = new Set<string>();
  rangeNodes.forEach((node) => {
    node.childKeys.forEach((childKey) => {
      if (rangeNodes.has(childKey)) hasParent.add(childKey);
    });
  });
  const rootKeys: string[] = [];
  rangeNodes.forEach((_node, key) => {
    if (!hasParent.has(key)) rootKeys.push(key);
  });
  return rootKeys;
}

// ── Tree data building ──────────────────────────────────────────

export function buildTreeData(group: LevelGroup, collapsedSet: Set<string>): TreeNode {
  const buildNode = (rangeKey: string): TreeNode | null => {
    const node = group.rangeNodes.get(rangeKey);
    if (!node) return null;
    const orderedChildren: string[] = [];
    if (node.lowerChildKey && group.rangeNodes.has(node.lowerChildKey)) {
      orderedChildren.push(node.lowerChildKey);
    }
    if (
      node.upperChildKey &&
      node.upperChildKey !== node.lowerChildKey &&
      group.rangeNodes.has(node.upperChildKey)
    ) {
      orderedChildren.push(node.upperChildKey);
    }
    node.childKeys.forEach((childKey) => {
      if (group.rangeNodes.has(childKey) && !orderedChildren.includes(childKey)) {
        orderedChildren.push(childKey);
      }
    });
    const children = orderedChildren.map(buildNode).filter(Boolean) as TreeNode[];
    const result: TreeNode = {
      id: rangeKey,
      rangeKey: node.rangeKey,
      level: node.level,
      startHeight: node.startHeight,
      endHeight: node.endHeight,
      length: node.length,
      edges: node.edges,
      mutualIds: node.mutualIds,
      hasRival: node.hasRival,
      bisected: node.bisected,
      ospConfirmed: node.ospConfirmed,
      children,
    };
    if (collapsedSet.has(rangeKey) && children.length > 0) {
      result._children = children;
      result.children = [];
    }
    return result;
  };
  const roots = group.rootKeys.map(buildNode).filter(Boolean) as TreeNode[];
  if (roots.length === 1) return roots[0];
  return { id: `${group.id}-root`, rangeKey: null, level: '-', edges: [], children: roots };
}

// ── Level groups ────────────────────────────────────────────────

export function buildLevelGroups(rangeIndex: RangeIndex, levelMeta: LevelMeta): LevelGroup[] {
  const allNodes = rangeIndex.rangeNodes;
  const groups = [
    { id: 'block', label: 'block', levelType: 'block' },
    { id: 'bigstep', label: 'bigstep', levelType: 'bigstep' },
    { id: 'smallstep', label: 'smallstep', levelType: 'smallstep' },
  ];

  return groups.map((group) => {
    const rangeNodes = new Map<string, RangeNode>();
    allNodes.forEach((node, key) => {
      if (resolveLevelType(node.level, levelMeta) === group.levelType) {
        rangeNodes.set(key, node);
      }
    });
    const rootKeys = computeRootKeys(rangeNodes);
    return { ...group, rangeNodes, rootKeys };
  });
}

// ── Auto-collapse ───────────────────────────────────────────────

export function applyAutoCollapse(
  groups: LevelGroup[],
  collapsedSet: Set<string>,
  expandedSet: Set<string>,
): void {
  const maxDepth = 100;
  groups.forEach((group) => {
    const visit = (rangeKey: string, depth: number) => {
      if (!rangeKey) return;
      if (depth > maxDepth && !expandedSet.has(rangeKey)) {
        collapsedSet.add(rangeKey);
      }
      const node = group.rangeNodes.get(rangeKey);
      if (!node) return;
      const childKeys = Array.from(node.childKeys).filter((key) => group.rangeNodes.has(key));
      childKeys.forEach((childKey) => visit(childKey, depth + 1));
    };
    group.rootKeys.forEach((rootKey) => visit(rootKey, 0));
  });
}

// ── State machine ───────────────────────────────────────────────

function emptyState(): AppliedState {
  return {
    edges: new Map(),
    roots: [],
    activeEdgeId: null,
    appliedEvents: [],
    currentStepIndex: -1,
  };
}

export function applyEvents(
  events: DecodedEvent[],
  upTo: number,
  parentByChild: Map<string, string>,
  edgeAddedById: Map<string, EdgeAddedMeta>,
  rangeByEdgeId: Map<string, { start: bigint; end: bigint }>,
  milestones: number[],
): AppliedState {
  const state = emptyState();
  const pendingChildren = new Map<string, string[]>();

  function attachChild(parentId: string, childId: string) {
    const parent = state.edges.get(parentId);
    if (parent) {
      if (!Array.isArray(parent.children)) {
        parent.children = [];
      }
      if (!parent.children.includes(childId)) {
        parent.children.push(childId);
      }
      return;
    }
    if (!pendingChildren.has(parentId)) {
      pendingChildren.set(parentId, []);
    }
    if (!pendingChildren.get(parentId)!.includes(childId)) {
      pendingChildren.get(parentId)!.push(childId);
    }
  }

  function getDerivedEdgeMeta(edgeId: string) {
    const id = normalizeHex(edgeId);
    const added = edgeAddedById.get(id) || null;
    const range = rangeByEdgeId.get(id) || null;
    const startHeight = range ? range.start.toString() : null;
    const endHeight = range ? range.end.toString() : null;
    const length = added?.length ?? (range ? (range.end - range.start).toString() : null);
    const level: number | string = Number.isFinite(added?.level) ? added!.level : '-';
    const staker = added?.staker ?? null;
    return { added, startHeight, endHeight, length, level, staker };
  }

  function ensureEdge(edgeId: string, parentId: string | null) {
    if (!edgeId) return;
    const meta = getDerivedEdgeMeta(edgeId);
    const existing = state.edges.get(edgeId);
    if (existing) {
      if (!Array.isArray(existing.children)) existing.children = [];
      if (parentId && !existing.parentId) {
        existing.parentId = parentId;
        attachChild(parentId, edgeId);
      }
      if (meta.startHeight != null) existing.startHeight = meta.startHeight;
      if (meta.endHeight != null) existing.endHeight = meta.endHeight;
      if (meta.length != null) existing.length = meta.length;
      if (meta.level !== '-') existing.level = meta.level;
      if (meta.staker) existing.staker = meta.staker;
      if (meta.added) {
        existing.hasRival = meta.added.hasRival ?? existing.hasRival;
        existing.isLayerZero = meta.added.isLayerZero ?? existing.isLayerZero;
        existing.originId = meta.added.originId ?? existing.originId;
        existing.mutualId = meta.added.mutualId ?? existing.mutualId;
        existing.claimId = meta.added.claimId ?? existing.claimId;
        existing.txHash = meta.added.txHash ?? existing.txHash;
      }
      return;
    }
    const added = meta.added;
    const edge: EdgeState = {
      id: edgeId,
      parentId: parentId || null,
      level: meta.level,
      length: meta.length,
      hasRival: added?.hasRival ?? false,
      isLayerZero: added?.isLayerZero ?? false,
      originId: added?.originId ?? null,
      mutualId: added?.mutualId ?? null,
      claimId: added?.claimId ?? null,
      staker: meta.staker,
      txHash: added?.txHash ?? null,
      startHeight: meta.startHeight,
      endHeight: meta.endHeight,
      children: [],
      bisected: false,
      ospConfirmed: false,
    };
    state.edges.set(edgeId, edge);
    if (edge.parentId) {
      attachChild(edge.parentId, edgeId);
    } else {
      state.roots.push(edgeId);
    }
  }

  for (let i = 0; i <= upTo; i += 1) {
    const ev = events[i];
    if (!ev) continue;
    state.appliedEvents.push(ev);

    if (ev.type === 'EdgeAdded') {
      const existing = state.edges.get(ev.edgeId);
      const inferredParent = parentByChild.get(ev.edgeId) || null;
      const childrenArray: string[] = existing?.children ? [...existing.children] : [];
      const edge: EdgeState = {
        id: ev.edgeId,
        parentId: inferredParent || existing?.parentId || null,
        level: Number.isFinite(ev.level) ? ev.level : existing?.level ?? '-',
        length: ev.length ?? existing?.length ?? null,
        hasRival: ev.hasRival ?? existing?.hasRival ?? false,
        isLayerZero: ev.isLayerZero ?? existing?.isLayerZero ?? false,
        originId: ev.originId ?? existing?.originId ?? null,
        mutualId: ev.mutualId ?? existing?.mutualId ?? null,
        claimId: ev.claimId ?? existing?.claimId ?? null,
        staker: existing?.staker ?? null,
        txHash: ev.txHash ?? existing?.txHash ?? null,
        startHeight: existing?.startHeight ?? null,
        endHeight: existing?.endHeight ?? null,
        children: childrenArray,
        bisected: existing?.bisected || false,
        ospConfirmed: existing?.ospConfirmed || false,
        lowerChildId: existing?.lowerChildId || null,
        upperChildId: existing?.upperChildId || null,
      };
      state.edges.set(ev.edgeId, edge);
      ensureEdge(ev.edgeId, edge.parentId);
      if (edge.parentId) {
        attachChild(edge.parentId, ev.edgeId);
      } else if (!state.roots.includes(ev.edgeId)) {
        state.roots.push(ev.edgeId);
      }
      if (pendingChildren.has(ev.edgeId)) {
        if (!Array.isArray(edge.children)) edge.children = [];
        for (const childId of pendingChildren.get(ev.edgeId)!) {
          if (!edge.children.includes(childId)) edge.children.push(childId);
        }
        pendingChildren.delete(ev.edgeId);
      }
      state.activeEdgeId = ev.edgeId;
    }

    if (ev.type === 'EdgeBisected') {
      ensureEdge(ev.edgeId, parentByChild.get(ev.edgeId) || null);
      ensureEdge(ev.lowerChildId, ev.edgeId);
      ensureEdge(ev.upperChildId, ev.edgeId);
      const edge = state.edges.get(ev.edgeId);
      if (edge) {
        edge.bisected = true;
        edge.lowerChildId = ev.lowerChildId || edge.lowerChildId;
        edge.upperChildId = ev.upperChildId || edge.upperChildId;
        if (!Array.isArray(edge.children)) edge.children = [];
        if (ev.lowerChildId && !edge.children.includes(ev.lowerChildId)) {
          edge.children.push(ev.lowerChildId);
        }
        if (ev.upperChildId && !edge.children.includes(ev.upperChildId)) {
          edge.children.push(ev.upperChildId);
        }
      }
      state.activeEdgeId = ev.edgeId;
    }

    if (ev.type === 'EdgeConfirmedByOneStepProof') {
      ensureEdge(ev.edgeId, parentByChild.get(ev.edgeId) || null);
      const edge = state.edges.get(ev.edgeId);
      if (edge) edge.ospConfirmed = true;
      state.activeEdgeId = ev.edgeId;
    }
  }

  state.currentStepIndex = stepIndexFor(upTo, milestones);
  return state;
}

// ── Milestones ──────────────────────────────────────────────────

export function computeMilestones(
  allEvents: DecodedEvent[],
  parentMap: Map<string, string>,
): number[] {
  const findAfter = (start: number, predicate: (ev: DecodedEvent) => boolean): number => {
    for (let i = Math.max(start, 0); i < allEvents.length; i += 1) {
      if (predicate(allEvents[i])) return i;
    }
    return -1;
  };

  const create = findAfter(0, (ev) => ev.type === 'EdgeAdded' && (ev as any).isLayerZero);
  const bisect1 = create >= 0 ? findAfter(create + 1, (ev) => ev.type === 'EdgeBisected') : -1;
  const layerzeroChild =
    bisect1 >= 0
      ? findAfter(
          bisect1 + 1,
          (ev) =>
            ev.type === 'EdgeAdded' && (ev as any).isLayerZero && parentMap.has((ev as any).edgeId),
        )
      : -1;
  const bisect2 =
    layerzeroChild >= 0 ? findAfter(layerzeroChild + 1, (ev) => ev.type === 'EdgeBisected') : -1;
  const osp =
    bisect2 >= 0 ? findAfter(bisect2 + 1, (ev) => ev.type === 'EdgeConfirmedByOneStepProof') : -1;
  return [create, bisect1, layerzeroChild, bisect2, osp];
}

export function stepIndexFor(index: number, milestones: number[]): number {
  let stepIndex = -1;
  milestones.forEach((milestone, idx) => {
    if (milestone >= 0 && index >= milestone) stepIndex = idx;
  });
  return stepIndex;
}

// ── Event formatting ────────────────────────────────────────────

export function formatEvent(
  ev: DecodedEvent,
  levelMeta: LevelMeta,
  edgeAddedById: Map<string, EdgeAddedMeta>,
  rangeByEdgeId: Map<string, { start: bigint; end: bigint }>,
): string {
  if (ev.type === 'EdgeAdded') {
    const edgeId = normalizeHex(ev.edgeId);
    const added = edgeAddedById.get(edgeId);
    const level = Number.isFinite(added?.level) ? added!.level : ev.level;
    const range = rangeByEdgeId.get(edgeId);
    const startHeight = range ? range.start.toString() : null;
    const endHeight = range ? range.end.toString() : null;
    const levelType = resolveLevelType(level, levelMeta);
    const rangeText = formatRangeText(startHeight, endHeight);
    const levelText = levelType ?? (Number.isFinite(level) ? `L${level}` : '?');
    return `EdgeAdded ${shortHex(ev.edgeId)} (level=${levelText}, range=${rangeText}, layerZero=${
      ev.isLayerZero
    })`;
  }
  if (ev.type === 'EdgeBisected') {
    return `EdgeBisected ${shortHex(ev.edgeId)} \u2192 ${shortHex(ev.lowerChildId)} / ${shortHex(
      ev.upperChildId,
    )}`;
  }
  if (ev.type === 'EdgeConfirmedByOneStepProof') {
    return `EdgeConfirmedByOneStepProof ${shortHex(ev.edgeId)}`;
  }
  return (ev as DecodedEvent).type;
}
