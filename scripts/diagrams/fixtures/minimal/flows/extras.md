---
title: Extras
showLanes: true
parts: [a, { b: { label: Bee } }]
edges:
  x: a -> b "batch -> blob"
  y: b <-> a dashed
paths:
  - { id: main, label: Main path, steps: [one, two] }
card: { cta: Open the flow, compact: true }
static:
  a: [10, 20]
---
