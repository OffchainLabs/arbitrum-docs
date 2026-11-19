---
title: How Prysm fits into an Ethereum node
showLanes: true
parts:
  - consensus-network
  - execution-network
  - beacon-node
  - execution-client
  - validator-client
edges:
  engine: beacon-node <-> execution-client "Engine API"
  beacon-api: validator-client -> beacon-node "Beacon API or gRPC"
---
