import React from 'react';
import { SPEED_OPTIONS } from './constants';

interface ControlBarProps {
  isPlaying: boolean;
  intervalMs: number;
  currentIndex: number;
  totalEvents: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onShowAll: () => void;
  onReset: () => void;
  onSetSpeed: (ms: number) => void;
}

export default function ControlBar({
  isPlaying,
  intervalMs,
  currentIndex,
  totalEvents,
  onPlay,
  onPause,
  onNext,
  onShowAll,
  onReset,
  onSetSpeed,
}: ControlBarProps) {
  const hasEvents = totalEvents > 0;
  const atEnd = currentIndex >= totalEvents - 1;

  return (
    <div className="ecf-controls">
      <button
        className={`ecf-btn ${isPlaying ? 'ecf-btn--pause' : 'ecf-btn--play'}`}
        disabled={!hasEvents}
        onClick={isPlaying ? onPause : onPlay}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button className="ecf-btn" disabled={!hasEvents || atEnd} onClick={onNext}>
        Next
      </button>
      <button className="ecf-btn ecf-btn--show-all" disabled={!hasEvents} onClick={onShowAll}>
        Show All
      </button>
      <button className="ecf-btn" disabled={!hasEvents} onClick={onReset}>
        Reset
      </button>
      <label className="ecf-speed-label">
        Speed
        <select
          className="ecf-select"
          value={intervalMs}
          onChange={(e) => onSetSpeed(Number(e.target.value))}
        >
          {SPEED_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
      <span className="ecf-progress">{`${Math.max(currentIndex + 1, 0)} / ${totalEvents}`}</span>
    </div>
  );
}
