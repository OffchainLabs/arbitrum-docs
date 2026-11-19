---
title: Static demo
svg: static-demo
alt: Alpha reads Beta, and Beta writes Delta.
parts: [a, b, e, c, d]
edges:
  ab: a -> b "reads"
  ba: b -> a
  bd: b -> d "writes"
  cd: c <-> d dotted
  ce: c -> e dashed
static:
  a: [0, 0]
  b: [2, 0]
  e: [1, 1]
  c: [0, 3]
  d: [2, 3]
---
