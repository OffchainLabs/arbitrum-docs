import { useState, useCallback } from 'react';
import type { LidiaDiagramConfig, LidiaState } from '../types';

export function useLidiaState(config: LidiaDiagramConfig) {
  const [state, setState] = useState<LidiaState>({
    currentStateId: config.initialStateId,
    history: [config.initialStateId],
  });

  const navigateToState = useCallback((stateId: string) => {
    setState((prev) => ({
      currentStateId: stateId,
      history: [...prev.history, stateId],
    }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.history.length <= 1) return prev;

      const newHistory = prev.history.slice(0, -1);
      return {
        currentStateId: newHistory[newHistory.length - 1],
        history: newHistory,
      };
    });
  }, []);

  const canGoBack = state.history.length > 1;

  const currentState = config.states.find((s) => s.id === state.currentStateId);

  return {
    currentState,
    navigateToState,
    goBack,
    canGoBack,
  };
}
