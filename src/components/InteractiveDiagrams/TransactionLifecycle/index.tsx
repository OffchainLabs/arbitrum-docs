import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlowChart } from './FlowChart';
import { PlaybackControls } from './PlaybackControls';
import { ANIMATION_STEPS, STEP_DURATION_MS } from './constants';
import type { PlaybackState, NodeId } from './types';

export default function TransactionLifecycle() {
  const [currentStep, setCurrentStep] = useState(0);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('stopped');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = ANIMATION_STEPS.length - 1;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advanceStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= totalSteps) {
        setPlaybackState('stopped');
        return prev;
      }
      return prev + 1;
    });
  }, [totalSteps]);

  // Auto-advance when playing
  useEffect(() => {
    if (playbackState === 'playing') {
      timerRef.current = setTimeout(advanceStep, STEP_DURATION_MS);
    }
    return clearTimer;
  }, [playbackState, currentStep, advanceStep, clearTimer]);

  // Stop when reaching the end
  useEffect(() => {
    if (currentStep >= totalSteps && playbackState === 'playing') {
      setPlaybackState('stopped');
    }
  }, [currentStep, totalSteps, playbackState]);

  const handlePlay = useCallback(() => {
    if (currentStep >= totalSteps) {
      setCurrentStep(0);
    }
    setPlaybackState('playing');
  }, [currentStep, totalSteps]);

  const handlePause = useCallback(() => {
    clearTimer();
    setPlaybackState('paused');
  }, [clearTimer]);

  const handleStop = useCallback(() => {
    clearTimer();
    setCurrentStep(0);
    setPlaybackState('stopped');
  }, [clearTimer]);

  const handleStepForward = useCallback(() => {
    clearTimer();
    setPlaybackState('paused');
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, [clearTimer, totalSteps]);

  const handleStepBack = useCallback(() => {
    clearTimer();
    setPlaybackState('paused');
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, [clearTimer]);

  const currentStepData = ANIMATION_STEPS[currentStep];
  const activeNodes = currentStepData?.activeNodes || [];
  const activeFlowPaths = currentStepData?.flowPaths || [];

  return (
    <div className="transaction-lifecycle">
      <div className="transaction-lifecycle__diagram">
        <FlowChart activeNodes={activeNodes as NodeId[]} activeFlowPaths={activeFlowPaths} />
      </div>
      <PlaybackControls
        playbackState={playbackState}
        currentStep={currentStep}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onStepForward={handleStepForward}
        onStepBack={handleStepBack}
      />
    </div>
  );
}
