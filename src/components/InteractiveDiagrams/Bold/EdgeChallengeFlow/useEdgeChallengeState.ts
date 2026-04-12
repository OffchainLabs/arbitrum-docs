import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import type {
  DecodedEvent,
  EdgeAddedMeta,
  AppliedState,
  RangeIndex,
  LevelMeta,
  LevelGroup,
} from './types';
import {
  buildParentMap,
  buildChildOrderMap,
  recomputeDerivedRanges,
  computeLevelMeta,
  buildRangeIndex,
  buildLevelGroups,
  applyEvents,
  computeMilestones,
  normalizeHex,
} from './edgeChallengeLogic';
import { DEFAULT_INTERVAL_MS } from './constants';

export interface EdgeChallengeStateResult {
  currentIndex: number;
  isPlaying: boolean;
  intervalMs: number;
  collapsedSet: Set<string>;
  expandedSet: Set<string>;
  selectedNodeKey: string | null;
  state: AppliedState;
  rangeIndex: RangeIndex;
  levelMeta: LevelMeta;
  levelGroups: LevelGroup[];
  edgeAddedById: Map<string, EdgeAddedMeta>;
  rangeByEdgeId: Map<string, { start: bigint; end: bigint }>;
  events: DecodedEvent[];
  play: () => void;
  pause: () => void;
  next: () => void;
  showAll: () => void;
  reset: () => void;
  setSpeed: (ms: number) => void;
  toggleNode: (rangeKey: string) => void;
  selectNode: (rangeKey: string | null) => void;
}

export function useEdgeChallengeState(
  events: DecodedEvent[],
  edgeAddedByIdRaw: Record<string, EdgeAddedMeta>,
): EdgeChallengeStateResult {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [intervalMs, setIntervalMs] = useState(DEFAULT_INTERVAL_MS);
  const [collapsedSet, setCollapsedSet] = useState<Set<string>>(() => new Set());
  const [expandedSet, setExpandedSet] = useState<Set<string>>(() => new Set());
  const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const edgeAddedById = useMemo(() => {
    const map = new Map<string, EdgeAddedMeta>();
    Object.entries(edgeAddedByIdRaw).forEach(([id, meta]) => {
      map.set(normalizeHex(id), meta);
    });
    return map;
  }, [edgeAddedByIdRaw]);

  const ospEdgeIds = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => {
      if (ev.type === 'EdgeConfirmedByOneStepProof') {
        set.add(normalizeHex((ev as any).edgeId));
      }
    });
    return set;
  }, [events]);

  const parentByChild = useMemo(() => buildParentMap(events), [events]);
  const childOrderByParent = useMemo(() => buildChildOrderMap(events), [events]);

  const { rangeByEdgeId, rangeKeyByEdgeId } = useMemo(
    () => recomputeDerivedRanges(edgeAddedById, childOrderByParent),
    [edgeAddedById, childOrderByParent],
  );

  const milestones = useMemo(
    () => computeMilestones(events, parentByChild),
    [events, parentByChild],
  );

  const levelMeta = useMemo(
    () => computeLevelMeta(edgeAddedById, ospEdgeIds),
    [edgeAddedById, ospEdgeIds],
  );

  const appliedState = useMemo(
    () =>
      applyEvents(events, currentIndex, parentByChild, edgeAddedById, rangeByEdgeId, milestones),
    [events, currentIndex, parentByChild, edgeAddedById, rangeByEdgeId, milestones],
  );

  const rangeIndex = useMemo(
    () =>
      buildRangeIndex(
        appliedState,
        edgeAddedById,
        rangeByEdgeId,
        rangeKeyByEdgeId,
        childOrderByParent,
      ),
    [appliedState, edgeAddedById, rangeByEdgeId, rangeKeyByEdgeId, childOrderByParent],
  );

  const levelGroups = useMemo(
    () => buildLevelGroups(rangeIndex, levelMeta),
    [rangeIndex, levelMeta],
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    if (timerRef.current) return;
    setIsPlaying(true);
    timerRef.current = setInterval(() => {
      if (currentIndexRef.current < events.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        clearTimer();
      }
    }, intervalMs);
  }, [events.length, intervalMs, clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const next = useCallback(() => {
    if (currentIndex < events.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, events.length]);

  const showAll = useCallback(() => {
    clearTimer();
    setCurrentIndex(events.length - 1);
    setCollapsedSet(new Set());
    setExpandedSet(new Set());
  }, [events.length, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setCurrentIndex(-1);
    setSelectedNodeKey(null);
  }, [clearTimer]);

  const setSpeed = useCallback(
    (ms: number) => {
      setIntervalMs(ms);
      if (timerRef.current) {
        clearTimer();
        setIsPlaying(true);
        timerRef.current = setInterval(() => {
          if (currentIndexRef.current < events.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else {
            clearTimer();
          }
        }, ms);
      }
    },
    [events.length, clearTimer],
  );

  const toggleNode = useCallback((rangeKey: string) => {
    setCollapsedSet((prev) => {
      const next = new Set(prev);
      if (next.has(rangeKey)) {
        next.delete(rangeKey);
        setExpandedSet((ex) => {
          const exNext = new Set(ex);
          exNext.add(rangeKey);
          return exNext;
        });
      } else {
        next.add(rangeKey);
        setExpandedSet((ex) => {
          const exNext = new Set(ex);
          exNext.delete(rangeKey);
          return exNext;
        });
      }
      return next;
    });
  }, []);

  const selectNode = useCallback((rangeKey: string | null) => {
    setSelectedNodeKey(rangeKey);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    currentIndex,
    isPlaying,
    intervalMs,
    collapsedSet,
    expandedSet,
    selectedNodeKey,
    state: appliedState,
    rangeIndex,
    levelMeta,
    levelGroups,
    edgeAddedById,
    rangeByEdgeId,
    events,
    play,
    pause,
    next,
    showAll,
    reset,
    setSpeed,
    toggleNode,
    selectNode,
  };
}
