# PdfModal

Opens an internal PDF in an overlay instead of navigating away from the page.

## How it gets used

Nothing in MDX needs to change. `components/mdx.tsx` wraps the `a` component so any **root-absolute**
`.pdf` href routes through this component:

```mdx
[view](/audit-reports/2026_07_10_trail_of_bits_arbos_60_61_report.pdf)
```

External PDFs (`https://…`) and relative paths are left to the normal link, so we never frame a
third-party document. It can also be used directly when a custom heading is wanted:

```mdx
<PdfModal href="/audit-reports/report.pdf" title="ArbOS 60 & 61 — Trail of Bits">view</PdfModal>
```

## Design notes

**The dialog is Radix, not hand-rolled.** `@radix-ui/react-dialog` supplies the focus trap, `Esc`
handling, scroll lock, ARIA wiring, and portalling — the parts that are easy to get subtly wrong.
Radix is already the primitive layer beneath `fumadocs-ui`'s accordions and popovers, and the version
is pinned to the one `fumadocs-ui` resolves (`1.1.19`) so pnpm dedupes it and the bundle does not grow.

**The PDF renders in an `<iframe>`,** delegating to the browser's built-in viewer. Scrolling, zoom,
search, and print all come free and no pdf.js bundle ships. Known trade-off: **iOS Safari renders only
the first page inside an iframe.** The header's "New tab" link is the escape hatch there, and doubles
as the download/print path everywhere else.

**The iframe mounts only while the dialog is open,** so opening the page fetches no PDFs. That matters
— the audit reports total ~42 MB.

**Modifier-clicks are deliberately passed through.** ⌘/Ctrl/Shift/Alt-click and middle-click behave
like any other link and open a new tab; only a plain left-click opens the overlay.

## Two things that will bite you

1. **`components/mdx.tsx` must WRAP the incoming `a`, not replace it.** `app/[lang]/docs/[[...slug]]/page.tsx`
   passes `a: createRelativeLink(source, page)`, which resolves relative markdown links against the
   current page. An earlier version of this component set `a:` before that spread, so the page's own
   `a` silently won and no modal ever opened. `withPdfModal` now composes with whatever `a` wins the
   merge.
2. **A new top-level asset path needs a `proxy.ts` bypass.** `/audit-reports/` is listed there. Without
   it the i18n middleware locale-mangles the request and the PDF 404s even though the file is in
   `public/` and the link is correct.
