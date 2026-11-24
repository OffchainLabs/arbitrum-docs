# Authoring a diagram

Follow these steps with your coding assistant (Claude Code, Codex, Cursor or another) to turn a
raster image or a description into a diagram for the docs. You propose the result as a pull
request; nothing here publishes.

## Start

You need two things:

- The source: a raster in `public/img/`, a raster you made (a sketch, a whiteboard photo of a
  diagram, an export from a drawing tool), or a description in words.
- The MDX page under `content/docs/` that will show the diagram.

If the contributor names a page that does not exist, or that `redirects.config.ts` sends
elsewhere, say so. Propose the page that now covers the subject, and ask which page to use.

Read the page section first. The diagram must say what the prose says, with the same terms. Read
[STYLE-GUIDE.md](../STYLE-GUIDE.md) before you write labels or alt text. Find the pages that use an
existing raster with `grep -rn <file-name> content/`.

A screenshot or a photo of something real (a wallet screen, a terminal, a dashboard) stays a
raster. Say so and stop.

Look for sibling rasters: other images on the same page that show the same parts, such as a
variant of the same setup. Tell the contributor, and propose to convert them together so the page
does not mix styles.

## Sort the input

Decide which kind of diagram this is, and tell the contributor which and why before you write any
file.

- **A flow diagram** shows Arbitrum parts and the messages between them: a wallet sends a
  transaction to a node, the Sequencer posts a batch to a contract. Go to
  [A flow diagram](#a-flow-diagram).
- **Concept art** is anything else: a layered stack, a timeline, a comparison, a single concept.
  Go to [Concept art](#concept-art).

## A flow diagram

A flow diagram is a text file that `pnpm diagrams:generate` turns into a static SVG. Read
[A flow file](../INTERNALS.md#a-flow-file) for the format and
[Limits of the static renderer](../INTERNALS.md#limits-of-the-static-renderer) before you place
anything; do not guess either. [tx-lifecycle-overview.md](flows/tx-lifecycle-overview.md) is a
complete static example.

1. Reuse parts from [parts.yaml](parts.yaml). Add a part only when no existing one fits. A flow
   lists each part id once, so a second box of the same thing (a second sequencer, a node that
   appears twice) is its own entry in `parts.yaml`, named for its role, like `fullnode-late`.
2. Every part needs a `kind` from [project.yaml](project.yaml) under `kinds`. If none fits (a CDN,
   a database, a Kubernetes service), do not stretch one: tell the contributor that a new kind is
   a change to `project.yaml` that a maintainer reviews, and ask how to proceed.
3. Write `diagrams/flows/<id>.md` with `svg:` (the output file name), `alt:` (the text a screen
   reader reads, which describes the whole diagram) and `static:` (a `[column, row]` cell for every
   part).
4. The cells come from the grid in [project.yaml](project.yaml) under `svg:`: `cols` gives the
   columns and `rows` the rows. The top-right cell holds the key, so a grid of 5 columns and 4
   rows has 19 cells for parts. Two parts cannot share a cell. Keep edge labels short: between
   neighbouring columns there is room for about one short word, and a label wider than its edge
   fails the generator.
5. Decide whether the parts fit. They do not fit when there are more parts than free cells, or when
   edges would cross each other, run through the same gap between boxes (edges in one gap are
   drawn on top of each other), or hide a label under a box. Then stop. Tell the contributor and
   offer two choices: a static image of a subset, or the interactive version (see
   [Offer an interactive diagram](#offer-an-interactive-diagram)). Let them choose.
6. For a subset, merge copies of the same thing into one box with a plural label ("Nitro full
   nodes"), and keep every kind of connection. If you must drop a connection, name it in your
   message and in the alt text, so the picture does not say something the prose does not.
7. Run `pnpm diagrams:generate`, then `pnpm diagrams:check`. Never edit the generated SVG or
   `flows.generated.ts`; change the flow file and generate again. The generator catches an edge
   through a box and a label wider than its edge. It does not catch overlapping edges or a label
   hidden under a box.
8. Look at the SVG in `public/img/<svg>.svg` (render it to PNG if your assistant cannot read SVG).
   Check that every label is readable, no arrow crosses a box or another arrow, and no label sits
   under a box.
9. Put it on the page, wrapped in `<ImageZoom>`, with the alt text on one line and `data-wide`:
   `<img src="/img/<svg>.svg" alt="…" data-wide />`. Remove any old `className` such as
   `img-900px`; no stylesheet defines it.

## Offer an interactive diagram

This section applies to flow diagrams only. Skip it for concept art. Make the offer once: if the
contributor already chose between a subset and the interactive version in step 5, do not repeat
it.

An interactive diagram is one the reader must interact with to see all of its content. The reader
steps through it: each step lights up the parts it uses and shows its own text, and can show code
links, a finality badge and what happens when the step fails.
[transaction-lifecycle.md](flows/transaction-lifecycle.md) is a complete example.

After the static image, check the source and the page. Offer the interactive version when the
content has at least one of these:

- An ordered sequence where each step needs its own explanation.
- Failure cases, code links or finality for individual steps.
- Alternative paths through the same parts, such as a direct and a retryable submission, or two
  sibling rasters that show variants of the same setup.

If it has none, say that the static image shows all of the content and no interactive version is
needed.

When you offer it, explain in two or three sentences what the reader would get, then ask. Never
build it unless the contributor says yes. If they do, add steps and `widget: <key>`, run
`pnpm diagrams:generate`, and put `<FlowDiagram flow="<key>" />` on the page.

The widget accepts less than the static SVG (see the last paragraph of
[Project config](../INTERNALS.md#project-config)). Every edge must be a solid, one-way arrow, every
part's kind needs `widget:` colours, and every step's lane needs `widget:` band colours. If the
static flow uses anything else, write the interactive version as a separate flow file and keep the
static one, as `transaction-lifecycle.md` and `tx-lifecycle-overview.md` do. Keep the static image
too if the page needs a picture that works without JavaScript or in print.

## Concept art

Concept art is a hand-written SVG. Follow
[the brand SVG skill](../.claude/skills/arbitrum-brand-svg-diagrams/SKILL.md): it is a plain
Markdown file that any assistant can open. The required parts are its palette, its accessibility
rules (`<title>`, `<desc>` and alt text) and every check in its "Verification" section. Match the
background of the other diagrams on the same page.

The colours of flow diagrams come from [theme.yaml](theme.yaml) and [project.yaml](project.yaml),
not from the skill. `ink` in `theme.yaml` is the light text on a chip, not the skill's dark ink.

## Finish

1. Run `pnpm exec prettier --check` on every changed file, then `pnpm lint` and
   `pnpm check-links`. For a flow diagram, `pnpm diagrams:check` must also pass.
2. List every file you changed, each check you ran and its result.
3. If the new diagram replaces a raster, run `grep -rn <old-file-name> content/ components/` first.
   Move the old file to the Trash (`trash public/img/<old-file>`) only when nothing references it.
4. The contributor reviews the page in the browser (`pnpm dev`, then open
   `http://localhost:3000`) and opens the pull request against `master`.
