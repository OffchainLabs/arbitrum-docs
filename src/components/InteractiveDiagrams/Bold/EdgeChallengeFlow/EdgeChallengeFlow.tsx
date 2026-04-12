import React, { useState, useEffect } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
// @ts-ignore – module alias resolved by Docusaurus at build time
import useBaseUrl from '@docusaurus/useBaseUrl';
import type { EdgeChallengeData } from './types';
import { useEdgeChallengeState } from './useEdgeChallengeState';
import ControlBar from './ControlBar';
import FlowSteps from './FlowSteps';
import NodeDetailsPanel from './NodeDetailsPanel';
import EventTimeline from './EventTimeline';
import D3EdgeTree from './D3EdgeTree';
import { ARBISCAN_BASE_URL } from './constants';

function EdgeChallengeFlowInner() {
  const [data, setData] = useState<EdgeChallengeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dataUrl = useBaseUrl('/data/edge-challenge-flow.json');

  useEffect(() => {
    fetch(dataUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message));
  }, [dataUrl]);

  if (error) {
    return <div className="ecf-error">Failed to load data: {error}</div>;
  }
  if (!data) {
    return <div className="ecf-loading">Loading edge challenge data...</div>;
  }

  return <EdgeChallengeFlowLoaded data={data} />;
}

function EdgeChallengeFlowLoaded({ data }: { data: EdgeChallengeData }) {
  const {
    currentIndex,
    isPlaying,
    intervalMs,
    collapsedSet,
    selectedNodeKey,
    state,
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
  } = useEdgeChallengeState(data.events, data.edgeAddedById);

  const challengeManager = data.meta.challengeManager;

  return (
    <div className="ecf-page">
      <div className="ecf-header-info">
        <p>
          Replay of real logs from Arbitrum Sepolia for ChallengeManager{' '}
          <a
            className="ecf-tx-link"
            href={`${ARBISCAN_BASE_URL}/address/${challengeManager}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {challengeManager}
          </a>
          .
        </p>
        <p>
          For more information or to use your own assertion data, visit the{' '}
          <a
            className="ecf-tx-link"
            href="https://offchainlabs.github.io/fraudproof-example-dashboard/edge-challenge-flow.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            BoLD assertion dashboard
          </a>
          .
        </p>
      </div>

      <ControlBar
        isPlaying={isPlaying}
        intervalMs={intervalMs}
        currentIndex={currentIndex}
        totalEvents={events.length}
        onPlay={play}
        onPause={pause}
        onNext={next}
        onShowAll={showAll}
        onReset={reset}
        onSetSpeed={setSpeed}
      />

      <FlowSteps currentStepIndex={state.currentStepIndex} />

      <div className="ecf-grid">
        <div className="ecf-panel ecf-tree">
          <h2>Edge Tree</h2>
          <div className="ecf-tree-grid">
            {levelGroups.map((group) => (
              <div key={group.id} className="ecf-tree-panel">
                <h3>{group.label}</h3>
                <D3EdgeTree
                  group={group}
                  state={state}
                  levelMeta={levelMeta}
                  collapsedSet={collapsedSet}
                  onSelectNode={selectNode}
                  onToggleNode={toggleNode}
                />
              </div>
            ))}
          </div>
          <div className="ecf-legend">
            <span>Blue: active edge</span>
            <span>Orange: bisected</span>
            <span>Red: hasRival</span>
            <span>Green: OSP confirmed</span>
          </div>
          <div className="ecf-hint">
            Tip: drag to pan, scroll to zoom, click nodes to view details, double-click to
            expand/collapse.
          </div>
        </div>

        <div className="ecf-sidebar">
          <div className="ecf-panel ecf-log">
            <h2>Information</h2>
            <div className="ecf-log-split">
              <div className="ecf-log-section">
                <h3>Node Info</h3>
                <NodeDetailsPanel
                  selectedNodeKey={selectedNodeKey}
                  rangeNodes={rangeIndex.rangeNodes}
                  state={state}
                  levelMeta={levelMeta}
                  edgeAddedById={edgeAddedById}
                />
              </div>
              <div className="ecf-log-section">
                <EventTimeline
                  appliedEvents={state.appliedEvents}
                  currentIndex={currentIndex}
                  levelMeta={levelMeta}
                  edgeAddedById={edgeAddedById}
                  rangeByEdgeId={rangeByEdgeId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EdgeChallengeFlow() {
  return (
    <BrowserOnly fallback={<div>Loading...</div>}>{() => <EdgeChallengeFlowInner />}</BrowserOnly>
  );
}
