export interface EdgeChallengeDataMeta {
  challengeManager: string;
  chain: string;
  fetchedAt: string;
}

export interface DecodedEventBase {
  type: string;
  blockNumber: number;
  logIndex: number;
  txHash: string;
}

export interface EdgeAddedEvent extends DecodedEventBase {
  type: 'EdgeAdded';
  edgeId: string;
  mutualId: string;
  originId: string;
  claimId: string;
  length: string;
  level: number;
  hasRival: boolean;
  isLayerZero: boolean;
}

export interface EdgeBisectedEvent extends DecodedEventBase {
  type: 'EdgeBisected';
  edgeId: string;
  lowerChildId: string;
  upperChildId: string;
  lowerChildAlreadyExists: boolean;
}

export interface EdgeConfirmedByOneStepProofEvent extends DecodedEventBase {
  type: 'EdgeConfirmedByOneStepProof';
  edgeId: string;
  mutualId: string;
}

export type DecodedEvent = EdgeAddedEvent | EdgeBisectedEvent | EdgeConfirmedByOneStepProofEvent;

export interface EdgeAddedMeta extends EdgeAddedEvent {
  staker?: string | null;
}

export interface EdgeChallengeData {
  meta: EdgeChallengeDataMeta;
  events: DecodedEvent[];
  edgeAddedById: Record<string, EdgeAddedMeta>;
}

export interface EdgeState {
  id: string;
  parentId: string | null;
  level: number | string;
  length: string | null;
  hasRival: boolean;
  isLayerZero: boolean;
  originId: string | null;
  mutualId: string | null;
  claimId: string | null;
  staker: string | null;
  txHash: string | null;
  startHeight: string | null;
  endHeight: string | null;
  children: string[];
  bisected: boolean;
  ospConfirmed: boolean;
  lowerChildId?: string | null;
  upperChildId?: string | null;
}

export interface AppliedState {
  edges: Map<string, EdgeState>;
  roots: string[];
  activeEdgeId: string | null;
  appliedEvents: DecodedEvent[];
  currentStepIndex: number;
}

export interface RangeNode {
  rangeKey: string;
  level: number | string;
  startHeight: string | null;
  endHeight: string | null;
  length: string | null;
  edges: { id: string; hasRival: boolean }[];
  edgeIds: Set<string>;
  mutualIds: Set<string>;
  hasRival: boolean;
  bisected: boolean;
  ospConfirmed: boolean;
  lowerChildKey: string | null;
  upperChildKey: string | null;
  childKeys: Set<string>;
}

export interface RangeIndex {
  rangeNodes: Map<string, RangeNode>;
  rootKeys: string[];
}

export interface LevelMeta {
  maxLevel: number | null;
  smallstepLevel: number | null;
}

export interface LevelGroup {
  id: string;
  label: string;
  rangeNodes: Map<string, RangeNode>;
  rootKeys: string[];
}

export interface TreeNode {
  id: string;
  rangeKey: string | null;
  level: number | string;
  startHeight?: string | null;
  endHeight?: string | null;
  length?: string | null;
  edges: { id: string; hasRival: boolean }[];
  mutualIds?: Set<string>;
  hasRival?: boolean;
  bisected?: boolean;
  ospConfirmed?: boolean;
  children: TreeNode[];
  _children?: TreeNode[];
}

export interface FlowStep {
  id: string;
  title: string;
  desc: string;
}
