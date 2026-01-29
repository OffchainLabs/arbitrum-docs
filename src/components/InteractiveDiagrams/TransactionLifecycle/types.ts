export interface ComponentPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FlowPath {
  id: string;
  from: string;
  to: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  dashed?: boolean;
}

export type PlaybackState = 'stopped' | 'playing' | 'paused';

export interface AnimationStep {
  id: number;
  label: string;
  activeNodes: string[];
  flowPaths?: string[];
}

export type NodeId =
  | 'userInbox'
  | 'delayedInbox'
  | 'sequencer'
  | 'sequencerFeed'
  | 'batchCompress'
  | 'sequencedTxs'
  | 'stf'
  | 'state'
  | 'l2Blocks'
  | 'l1Chain';

export interface DiagramNode {
  id: NodeId;
  label: string;
  position: ComponentPosition;
  color: string;
  deepDiveLink: string;
}
