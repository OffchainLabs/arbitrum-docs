import React, { useCallback } from 'react';
import type { RangeNode, AppliedState, LevelMeta, EdgeAddedMeta } from './types';
import { shortHex, normalizeHex, formatRangeText, resolveLevelType } from './edgeChallengeLogic';
import { ARBISCAN_BASE_URL } from './constants';

interface NodeDetailsPanelProps {
  selectedNodeKey: string | null;
  rangeNodes: Map<string, RangeNode>;
  state: AppliedState;
  levelMeta: LevelMeta;
  edgeAddedById: Map<string, EdgeAddedMeta>;
}

export default function NodeDetailsPanel({
  selectedNodeKey,
  rangeNodes,
  state,
  levelMeta,
  edgeAddedById,
}: NodeDetailsPanelProps) {
  const copyToClipboard = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // fallback
    }
  }, []);

  if (!selectedNodeKey || !rangeNodes.get(selectedNodeKey)) {
    return (
      <div className="ecf-node-details ecf-node-details--empty">
        <p className="ecf-placeholder-text">
          Click a node in the Edge Tree to inspect its range, level, mutual ID, rival status, and
          associated edges.
        </p>
      </div>
    );
  }

  const node = rangeNodes.get(selectedNodeKey)!;

  const levelType = resolveLevelType(node.level, levelMeta);
  const levelText = levelType ?? (node.level !== '-' ? `Level ${node.level}` : 'Level ?');
  const rangeText = formatRangeText(node.startHeight, node.endHeight);
  const rivalStatus = node.hasRival ? 'Yes' : 'No';
  const mutualIds = Array.from(node.mutualIds);

  return (
    <div className="ecf-node-details">
      <div className="ecf-field">
        <span className="ecf-field-label">Range:</span>
        {rangeText}
      </div>
      <div className="ecf-field">
        <span className="ecf-field-label">Level:</span>
        {levelText}
      </div>
      <div className="ecf-field">
        <span className="ecf-field-label">{mutualIds.length > 1 ? 'MutualIds' : 'MutualId'}:</span>
        {mutualIds.length === 0 ? (
          '-'
        ) : mutualIds.length === 1 ? (
          <span className="ecf-copy-item">
            <code className="ecf-copy-text">{shortHex(mutualIds[0], 8, 6)}</code>
            <button className="ecf-copy-btn" onClick={() => copyToClipboard(mutualIds[0])}>
              Copy
            </button>
          </span>
        ) : (
          <div className="ecf-copy-list">
            {mutualIds.map((id) => (
              <div key={id} className="ecf-copy-item">
                <code className="ecf-copy-text">{shortHex(id, 8, 6)}</code>
                <button className="ecf-copy-btn" onClick={() => copyToClipboard(id)}>
                  Copy
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="ecf-field">
        <span className="ecf-field-label">Rival Status:</span>
        {rivalStatus}
      </div>

      {node.edges.length > 0 ? (
        <div className="ecf-edge-list">
          <strong>Edges:</strong>
          {node.edges.map((edge) => {
            const edgeAdded = edgeAddedById.get(normalizeHex(edge.id));
            const txHash = edgeAdded?.txHash ? normalizeHex(edgeAdded.txHash) : null;
            const txLink = txHash ? `${ARBISCAN_BASE_URL}/tx/${txHash}` : null;
            const edgeStatus = state.edges.get(edge.id);
            const isLayerZero = edgeStatus?.isLayerZero === true;
            let status = 'Active';
            if (edgeStatus?.ospConfirmed) status = 'OSP Confirmed';
            else if (edgeStatus?.bisected) status = 'Bisected';

            const stakerAddress = edgeStatus?.staker || null;
            const staker = stakerAddress ? shortHex(stakerAddress, 6, 4) : 'unknown';
            const hasRival = edge.hasRival || edgeStatus?.hasRival || false;

            return (
              <div key={edge.id} className="ecf-edge-item">
                <div className="ecf-edge-item-header">
                  Edge ID: <code className="ecf-copy-text">{shortHex(edge.id)}</code>
                  <button className="ecf-copy-btn" onClick={() => copyToClipboard(edge.id)}>
                    Copy
                  </button>
                </div>
                <div className="ecf-edge-item-detail">
                  Tx:{' '}
                  {txLink ? (
                    <a
                      className="ecf-tx-link"
                      href={txLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {shortHex(txHash!, 8, 6)}
                    </a>
                  ) : (
                    '-'
                  )}
                </div>
                <div className="ecf-edge-item-detail">LayerZero: {isLayerZero ? 'Yes' : 'No'}</div>
                <div className="ecf-edge-item-detail">Staker: {staker}</div>
                <div className="ecf-edge-item-detail">
                  Status: {status}
                  {hasRival ? ' (hasRival)' : ''}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="ecf-edge-list">
          <em>No edges</em>
        </div>
      )}
    </div>
  );
}
