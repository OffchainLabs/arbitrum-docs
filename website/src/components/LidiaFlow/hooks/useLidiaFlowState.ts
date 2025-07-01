import { useState, useCallback, useMemo } from 'react';
import type { LidiaFlowConfig, LidiaFlowState } from '../types';

export function useLidiaFlowState(config: LidiaFlowConfig) {
  const [state, setState] = useState<LidiaFlowState>({
    currentStateId: config.initialStateId,
    history: [],
  });

  const currentState = useMemo(
    () => config.states.find((s) => s.id === state.currentStateId),
    [config.states, state.currentStateId],
  );

  const navigateToState = useCallback((stateId: string) => {
    setState((prev) => ({
      currentStateId: stateId,
      history: [...prev.history, prev.currentStateId],
    }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.history.length === 0) return prev;

      const newHistory = [...prev.history];
      const previousStateId = newHistory.pop()!;

      return {
        currentStateId: previousStateId,
        history: newHistory,
      };
    });
  }, []);

  const canGoBack = state.history.length > 0;

  return {
    currentState,
    navigateToState,
    goBack,
    canGoBack,
  };
}
