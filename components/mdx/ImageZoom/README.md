# ImageZoom

Compatibility wrapper around Fumadocs' native `ImageZoom`
(`fumadocs-ui/components/image-zoom`) that feeds it a plain `<img>` child. It
preserves the ported arbitrum-docs prop surface so legacy MDX doesn't need
rewrites.

Registered globally in [`components/mdx.tsx`](../../mdx.tsx), so MDX pages use
`<ImageZoom>` with no import:

```mdx
<ImageZoom
  src="/img/example.png"
  alt="Example diagram"
  caption="Optional caption text"
  className="img-600px"
/>
```

Behavior:

- **No `width`/`height` required** — renders a plain `<img>`, so it works for
  legacy images whose dimensions aren't known.
- Adds a `<figure>` + `<figcaption>` via the `caption` prop.
- Skips Next.js image optimization (no `_next/image` srcset).

> To use Fumadocs' native `ImageZoom` directly instead of this wrapper (for
> Next.js image optimization), see the image-zoom convention in
> [`CLAUDE.md`](../../../CLAUDE.md).
