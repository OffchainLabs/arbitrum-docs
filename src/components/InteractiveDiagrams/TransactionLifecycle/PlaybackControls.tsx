import React from 'react';
import type { PlaybackState } from './types';
import { ANIMATION_STEPS } from './constants';

interface PlaybackControlsProps {
  playbackState: PlaybackState;
  currentStep: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
}

export function PlaybackControls({
  playbackState,
  currentStep,
  onPlay,
  onPause,
  onStop,
  onStepForward,
  onStepBack,
}: PlaybackControlsProps) {
  const currentStepData = ANIMATION_STEPS[currentStep];
  const totalSteps = ANIMATION_STEPS.length - 1; // Exclude step 0 (Ready)

  return (
    <div className="transaction-lifecycle__controls">
      <div className="transaction-lifecycle__controls-buttons">
        <button
          onClick={onStepBack}
          disabled={currentStep === 0}
          aria-label="Previous step"
          className="transaction-lifecycle__control-btn"
        >
          <StepBackIcon />
        </button>

        {playbackState === 'playing' ? (
          <button
            onClick={onPause}
            aria-label="Pause"
            className="transaction-lifecycle__control-btn transaction-lifecycle__control-btn--primary"
          >
            <PauseIcon />
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={currentStep === totalSteps}
            aria-label="Play"
            className="transaction-lifecycle__control-btn transaction-lifecycle__control-btn--primary"
          >
            <PlayIcon />
          </button>
        )}

        <button
          onClick={onStop}
          disabled={currentStep === 0 && playbackState === 'stopped'}
          aria-label="Stop and reset"
          className="transaction-lifecycle__control-btn"
        >
          <StopIcon />
        </button>

        <button
          onClick={onStepForward}
          disabled={currentStep === totalSteps}
          aria-label="Next step"
          className="transaction-lifecycle__control-btn"
        >
          <StepForwardIcon />
        </button>
      </div>

      <div className="transaction-lifecycle__step-indicator">
        <span className="transaction-lifecycle__step-number">
          Step {currentStep}/{totalSteps}
        </span>
        <span className="transaction-lifecycle__step-label">
          {currentStepData?.label || 'Ready'}
        </span>
      </div>

      <div className="transaction-lifecycle__progress-bar">
        <div
          className="transaction-lifecycle__progress-fill"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const StopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h12v12H6z" />
  </svg>
);

const StepBackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
  </svg>
);

const StepForwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
);
