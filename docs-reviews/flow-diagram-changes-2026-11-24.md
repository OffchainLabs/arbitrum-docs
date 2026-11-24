# Flow diagram changes, 2026-11-24

This document records every change made to the interactive flow diagrams on 2026-11-24, in the
order I asked for them, with the reason for each. It is for the technical writer team: what
readers now see, why it changed, and what changes for anyone who edits a diagram.

The diagrams are the `FlowDiagram` widget on two pages:

- [Transaction submission flow](/how-arbitrum-works/deep-dives/transaction-submission-flow)
  (`content/docs/how-arbitrum-works/deep-dives/transaction-submission-flow.mdx`), two tabs:
  "Transaction sent to the Sequencer" and "Retryable ticket sent from the parent chain".
- [Nitro transaction flow](/how-arbitrum-works/deep-dives/nitro-transaction-flow)
  (`content/docs/how-arbitrum-works/deep-dives/nitro-transaction-flow.mdx`).

Most changes are in the widget, so they apply to both pages. Where one applies to one page only,
it says so.

A separate list of prose changes for writers to make is in
`docs-reviews/transaction-submission-flow-content-changes.md`. Item 13 below explains where it
came from.

## At a glance: what a reader sees now

1. The tabs say what each path is, and the page intros are shorter.
2. Step text sits in a caption joined to Back and Next at the bottom of the diagram, so it changes
   where the reader is already looking. The caption can be dragged out of the way.
3. Each step's text has two tabs, "What happens" and "If it fails", and a footer with the docs
   link, the code link and (Nitro page) the config flag.
4. Every step shows a finality track: Soft confirmation, Hard finality, Settlement.
5. Code in step text (`eth_sendRawTransactionSync`, flags, parameters) shows in code style.
6. The diagram has a full screen mode, with a hint to press Esc to leave it.
7. The key across the top of the diagram names the node types and both chains.
8. Node and edge labels on the transaction submission diagram say what each part does and what
   travels along each arrow.

## The changes, in order

### 1. Put the tab explanation in the diagram, not the intro

- **What I asked:** move "The first tab follows a transaction that you send to the Sequencer.
  The second tab follows a retryable ticket that you send from the parent chain." from the
  intro into the diagram.
- **Why:** the intro was too long to read. Readers lose focus before they reach the diagram and
  miss what it says.
- **What changed:**
  - The tabs now read "Transaction sent to the Sequencer" and "Retryable ticket sent from the
    parent chain" (they were "Send to the Sequencer" and "Send a retryable from the parent
    chain").
  - The sentence is gone from the transaction submission page intro.
  - Lost: the glossary hover links on Sequencer, retryable ticket and parent chain that were in
    that sentence. The link on "transaction" stays.

### 2. Make the navigation instructions part of the diagram

- **What I asked:** make "Press Next and Back, or the arrow keys while the diagram has focus …
  Select Show details …" clearer than a sentence on the page.
- **Why:** instructions in a paragraph are easy to skip. A reader should learn the controls from
  the controls.
- **What changed:**
  - When the diagram has keyboard focus, the step bar shows "or ← → keys" beside Next. It shows
    only then, because the arrow keys only work then, and not on phones, which have no arrow keys.
  - The navigation sentences are gone from both page intros.
  - The details checkbox got a label that said what it opened. Item 8 later replaced the checkbox
    with tabs.
- **Bug fixed along the way (from my change):** the hint appeared on mouse-down, widened the
  step bar and moved the buttons, so a first click on the desktop could miss. The hint's space is
  now always reserved.

### 3. Full screen mode

- **What I asked:** add a full screen mode for the diagram.
- **Why:** the diagram is dense, and a bigger canvas makes it easier to follow.
- **What changed:**
  - A full screen button at the right end of the step bar. Full screen fills the browser window,
    over the site header. Esc or the same button leaves it, and the page returns to where the
    reader was.
  - It fills the window rather than using the browser's native full screen. Native full screen
    would hide the "Look inside" detail view and does not work on iPhone.
- **Bugs fixed along the way:** the two chain names could land on top of each other in full
  screen on a phone; the arrow-key hint widened the detail view so it sat off center at tablet
  width (the detail view no longer shows that hint); and the step bar was 5px too wide for a
  phone (its gaps are now smaller on phones).

### 4. Hint to press Esc

- **What I asked:** show a hint that Esc leaves full screen.
- **Why:** readers need to know how to get out.
- **What changed:** on entering full screen, "Press Esc to exit full screen" shows at the top
  center for 3 seconds, then fades. It shows from 768px wide only, since phones have no Esc key.
  Screen readers announce it once, and the exit button announces Esc as its shortcut.

### 5. Keep each step's text with the diagram

- **What I asked:** make each step's explanation obviously belong to the diagram step.
- **Why:** the text sat in a card under a 720px canvas, below the fold on a laptop. Readers
  pressed Next and never saw it.
- **What changed:**
  - The step text is now a caption in a dark panel joined to the step bar, at the bottom of the
    canvas. It changes right above Next. While the canvas runs below the fold, the panel sticks to
    the bottom of the screen, so the text stays visible.
  - The camera frames each step above the panel, so the panel does not cover the step.
  - The canvas is at most as tall as the screen (less the site header), so the canvas and caption
    fit together.
  - Long captions scroll inside the panel (160px on phones, 240px wider, a third of the screen in
    full screen).
- **Known limit:** before the reader presses Next or scrolls the whole diagram into view, the
  panel can cover the lower part of the graph. Next and Back scroll the diagram fully into view,
  which fixes it.

### 6. Let readers move the caption

- **What I asked:** make the caption movable, because it may cover the diagram.
- **Why:** no fixed spot suits every step. The reader should be able to uncover what they want
  to see.
- **What changed:**
  - A grip at the top of the panel. Drag it to move the panel anywhere inside the diagram. Arrow
    keys on the grip move it 16px. Double-click the grip, or press Home on it, to put it back.
  - While moved, the camera uses the whole canvas.
  - For keyboard and screen reader users, Back and Next come before the caption text, so Tab
    reaches them first, and a screen reader that presses Next and reads on hears the new text.

### 7. Code style in step text

- **What I asked:** show identifiers like `eth_sendRawTransactionSync` in code style.
- **Why:** readability. Method names, flags and parameters stand out from the prose.
- **What changed:** step text and failure text render text in backticks as code. I marked RPC
  methods, fields, hex values, block tags, retryable parameters, events, precompile methods, Nitro
  flags and metric names in the three widget flows. Part names that are also node labels
  (SequencerInbox, Inbox, Bridge) stay plain so the text matches the boxes. Quoted log messages
  stay as text.

### 8. Replace the details checkbox with tabs

- **What I asked:** fix the "Show code and failure details" section, whose UX was odd.
- **Why:** a checkbox reads as a setting. What it opened landed below the caption's height, out of
  sight, and it lumped a one-line code link with three paragraphs on failure.
- **What changed:**
  - Steps with failure text get two tabs: "What happens" and "If it fails". The content swaps in
    place.
  - The failure paragraphs use run-in labels ("What you see." …) so all three fit.
  - A footer under the text holds the docs link, the code link and, on the Nitro page, the config
    flag. These were hidden behind the checkbox.
  - The tab a reader picks stays when the next step also has failure text, so they can walk the
    failure modes. Arrow keys on the tabs switch tabs and do not change the step.

### 9. Make the tabs look like tabs

- **What I asked:** the tabs were not obviously tabs. Update the design.
- **Why:** the first version drew them as small pills, which read as tags.
- **What changed:** the labels sit on a thin divider line. The selected tab is bright with a
  brand-blue underline; the other is dimmed, with a faint underline on hover.

### 10. The wallet node

- **What I asked:** "User wallet / Any EVM wallet · off-chain" made no sense to me. To send to
  the Sequencer, the wallet has to be on the child chain.
- **Why:** the line hid the one thing a reader needs, which chain the wallet signs for, and
  "off-chain" read as "not on Arbitrum".
- **What changed:** the node now reads "User wallet / Set to Arbitrum One", on both pages. An
  interim version added "· your device"; I asked to drop it.

### 11. Put the chain names in the key

- **What I asked:** "Child chain · Arbitrum One" and "Parent chain · Ethereum" sat in odd places.
  Move them where readers can see them.
- **Why:** the names floated over the graph and moved on every step. When the parent chain was
  mostly off screen, its name could sit inside the child chain area.
- **What changed:**
  - The floating names are gone. Both chains are now in the key, each with a swatch drawn like its
    area on the diagram.
  - From 768px wide, the key is one strip across the top of the diagram, and the camera frames
    the graph below it, so the key never covers a node. A five-row key box covered an active node,
    which is why it became a strip. On phones the key stays behind the "Key" button.

### 12. Fast Feed label

- **What I asked:** "Paid, per transaction" is confusing.
- **Why:** it reads as a price per transaction. Access is a ticket bought per ticket round, at one
  price for everyone in the round (`fast-feed.mdx:55-61`).
- **What changed:** Fast Feed reads "Paid, streams each transaction", and the Sequencer feed "Free,
  streams each block".

### 13. Review of the "Transaction sent to the Sequencer" diagram

- **What I asked:** review the diagram against all its steps and the rest of the repo, suggest
  changes for readability and clarity, then verify the findings, fix the UX, labels and design,
  and write the content changes up for the writers.
- **Why:** labels, links and design are fixed in code here. Prose and other docs pages belong to
  the writers.
- **What changed in the diagram** (transaction submission page unless marked):
  - **Edge labels** name what travels along the arrow: "Signed transaction", "Forwarded
    transaction", "Sequenced messages", "Compressed batch", "Accumulator entry", "Send root".
    Before, they mixed five grammatical forms ("eth_sendRawTransaction", "Forwards the
    transaction", "Message log", "Batch (parent chain tx)", "Append to accumulator").
  - **Node sub-lines** say what each node does instead of "nitro · child chain" four times: RPC
    node "Forwards to the Sequencer", Sequencer "Orders and executes", Batch poster "Posts
    batches", Proposer "Posts assertions", plus the feed lines from item 12.
  - **Proposer, not Validator**, posts the assertion (`STYLE-GUIDE.md:58`). The step text's first
    word changed to match. This covers both tabs.
  - **The Outbox is drawn** in the Settle step, with a "Send root" arrow from the Rollup. The text
    named it, but the diagram did not show it.
  - **Step titles are verbs:** "Publish on the Fast Feed", "Publish the block", "Finalize on the
    parent chain". Step URLs did not change.
  - **Links:** the Submit step links "How transactions reach the Sequencer"; it linked a page that
    contradicts the diagram. The Settle step links "Child to parent chain messaging"; it linked
    "The reorg model", which is about reorgs. The Sequencer feed and RPC node now preview their
    pages on hover.
  - **Finality track** on every step: Soft confirmation › Hard finality › Settlement. Reached levels
    show a check; the level this step reaches is outlined. Before, a badge appeared on three steps
    only, so readers never saw where they were. Both pages.
  - **Step number on the node** when a step lights no arrow. The arrows carried numbers 1, 1, 4, 5,
    6, 6, 6, 8, so readers looked for steps 2, 3, 7 and 9 and found nothing. Both pages.
  - **"Look inside ›" chip** on the node that opens a detail view. Before, only a pulse hinted at
    it, and reduced motion turns the pulse off. Both pages.
  - **Show all** folds the caption to its title, with "Back to this step", so the whole graph gets
    the space. Before, the graph shrank until labels could not be read. Both pages.
  - **"Offchain"**, not "Off-chain" (`STYLE-GUIDE.md:141`).
  - **Nitro page:** its feed step's badge says "Soft confirmation", like the other page, instead of
    "Soft finality".
- **Not changed, with reason:** the Proposer stays low in the diagram, because rows are time and it
  first appears in step 8. Glossary links inside step text need engineering work and are listed
  in the writers' file.
- **Written up for writers:** `docs-reviews/transaction-submission-flow-content-changes.md`
  (committed separately). It lists 16 prose and docs changes, sorted by priority, each re-read
  against the repo, with proposed text. The most urgent: steps 1 and 3 describe RPC behavior that
  is not live yet (`notices/transaction-submission-changes-notice.mdx:10`), and the docs define
  hard finality four ways.

## What changed for authors

If you edit a diagram in `diagrams/`, these are new:

- **Code in step text:** wrap it in backticks. The caption renders it as code.
- **Card labels:** a flow's `card:` now takes `overviewTab` and `failureTab` (the two tab names)
  in place of `detailsToggle`. `INTERNALS.md` lists the six keys.
- **Per-flow sub-lines:** a flow's `parts:` list can override a shared part's sub-line, for
  example `- seq: { tech: 'Orders and executes' }`, without changing it on other diagrams.
- **A lane with no lane word:** `short: null` in `diagrams/project.yaml` shows no lane word on
  that lane's nodes (the offchain lane uses it). A missing `short` still fails the generator.
- **New part:** `outbox` in `diagrams/parts.yaml`.
- After any edit, run `pnpm diagrams:generate`.

## Files

- **Widget:** `components/widgets/FlowDiagram/` (`FlowDiagram.tsx`, `StepBar.tsx`, `StepCard.tsx`,
  `Legend.tsx`, `ActorNode.tsx`, `useStepCamera.ts`, `useStepNavigation.ts`, `graph.ts`,
  `FlowCanvas.tsx`, `DetailOverlay.tsx`, `BandNode.tsx`, `layout.ts`, `model.ts`, new
  `useDockPosition.ts`; `BandLabels.tsx` deleted; `flows.generated.ts` regenerated).
- **Diagram data:** `diagrams/flows/transaction-submission-flow.md`,
  `diagrams/flows/transaction-lifecycle.md`, `diagrams/flows/pga-round.md`, `diagrams/parts.yaml`,
  `diagrams/project.yaml`.
- **Generator:** `scripts/generate-diagrams.ts`, `scripts/diagrams/schema.ts`,
  `scripts/diagrams/types.ts`.
- **Pages:** the two page intros.
- **Docs:** `INTERNALS.md` (the card keys).
- **Tests:** `tests/browser/tx-submission-flow.test.ts`, `tests/browser/nitro-tx-flow.test.ts`,
  `tests/browser/flow-page.ts`, `scripts/flow-diagram/layout.test.ts`,
  `scripts/flow-diagram/submission-flow.test.ts`, `scripts/generate-diagrams.test.ts`.

## Checks

On 2026-11-24, against `pnpm dev`: both diagram browser suites pass (71 of 71), `pnpm test`
passes (905 node tests with no failures; 127 of 127 vitest tests), and the type check,
`pnpm diagrams:check` and Prettier are clean. ESLint over `content/` reports no errors.

## Known limits

- Before the reader's first Next, Back or scroll, the caption can cover the lower part of the
  graph (item 5).
- In full screen, Tab can move focus to page links hidden behind the diagram. Esc still leaves.
- On a 375px phone, the step bar has 3px to spare. A longer bar label would overflow; a browser
  test catches it.
- The Nitro page's flag row for the Sequence step reads `--node.sequencer and
--execution.sequencer.enable` as one code span, because that is how the step's `flag:` is
  written.
