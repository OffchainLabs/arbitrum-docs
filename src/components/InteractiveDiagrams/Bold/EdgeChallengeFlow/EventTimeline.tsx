import React, { useEffect, useRef } from 'react';
import type { DecodedEvent, LevelMeta, EdgeAddedMeta } from './types';
import { formatEvent } from './edgeChallengeLogic';

interface EventTimelineProps {
  appliedEvents: DecodedEvent[];
  currentIndex: number;
  levelMeta: LevelMeta;
  edgeAddedById: Map<string, EdgeAddedMeta>;
  rangeByEdgeId: Map<string, { start: bigint; end: bigint }>;
}

export default function EventTimeline({
  appliedEvents,
  currentIndex,
  levelMeta,
  edgeAddedById,
  rangeByEdgeId,
}: EventTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeline = containerRef.current;
    if (!timeline) return;
    const currentItem = timeline.querySelector('.ecf-log-current') as HTMLElement | null;
    if (currentItem) {
      // The actual scroll container is .ecf-log-section (parent with overflow: auto)
      const scrollContainer =
        (timeline.closest('.ecf-log-section') as HTMLElement | null) ?? timeline;
      const containerRect = scrollContainer.getBoundingClientRect();
      const itemRect = currentItem.getBoundingClientRect();
      const offset = itemRect.top - containerRect.top + scrollContainer.scrollTop;
      scrollContainer.scrollTop = offset - containerRect.height / 2;
    }
  }, [currentIndex]);

  return (
    <div className="ecf-timeline" ref={containerRef}>
      <h3>Event Timeline</h3>
      {appliedEvents.length === 0 ? (
        <p className="ecf-placeholder-text">
          Press Play or Next to step through onchain events. Each event will appear here as it is
          replayed.
        </p>
      ) : (
        <ol className="ecf-event-log">
          {appliedEvents.map((ev, index) => (
            <li
              key={`${ev.blockNumber}-${ev.logIndex}`}
              className={index === currentIndex ? 'ecf-log-current' : undefined}
            >
              [{ev.blockNumber}/{ev.logIndex}]{' '}
              {formatEvent(ev, levelMeta, edgeAddedById, rangeByEdgeId)}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
