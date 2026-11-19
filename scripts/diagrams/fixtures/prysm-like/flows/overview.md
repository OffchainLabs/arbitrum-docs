---
title: How Prysm fits into an Ethereum node
showLanes: true
alt: Prysm runs the beacon node and the validator client.
parts:
  - consensus-network
  - execution-network
  - beacon-node
  - execution-client
  - validator-client
edges:
  engine: beacon-node <-> execution-client "Engine API"
  beacon-api: validator-client -> beacon-node "Beacon API or gRPC"
static:
  consensus-network: [0, 0]
  beacon-node: [1, 0]
  validator-client: [2, 0]
  execution-network: [0, 2]
  execution-client: [1, 2]
---
