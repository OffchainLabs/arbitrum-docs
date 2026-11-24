# Transaction submission flow: content changes for technical writers

This list covers the diagram on the Transaction submission flow page
(`content/docs/how-arbitrum-works/deep-dives/transaction-submission-flow.mdx`, served at
`/how-arbitrum-works/deep-dives/transaction-submission-flow`), "Transaction sent to the
Sequencer" tab. Each item is a change to prose or to another docs page.
Labels, links and the diagram's design are already fixed (see the end of this file).

Every citation below was re-read in this repo on 2026-11-24. Line numbers are as of that date.

## How to edit the diagram text

- The step text lives in `diagrams/flows/transaction-submission-flow.md` (TSF below), one `##`
  section per step. The round detail view is `diagrams/flows/pga-round.md` (PGAR below).
- Write each step's text as plain sentences. Wrap code in backticks (`eth_getTransactionReceipt`);
  the caption renders it as code. `{var:name}` reads `content/vars.json`.
- A step's `### Failure` section takes three paragraphs that start `**Symptoms.**`,
  `**Impact.**` and `**Recovery.**`. They show on the caption's "If it fails" tab.
- After an edit, run `pnpm diagrams:generate`, then check the page in `pnpm dev`.
- The caption shows about 240px of text before it scrolls. Keep each step to four or five short
  sentences.

## Priority 1: accuracy

### 1. Steps 1 and 3 describe RPC behavior that is not live yet

- **Where:** TSF:62 (Submit), TSF:68 (Submit, failure Impact), TSF:91 (Order and execute).
- **Problem:** TSF:62 says `eth_sendRawTransaction` "returns the transaction hash when the
  transaction enters the queue". TSF:91 says `eth_sendRawTransactionSync` "returns here with a
  partial receipt". The notice says "The changes are not live yet"
  (`content/docs/notices/transaction-submission-changes-notice.mdx:10`). Its table lists today's
  behavior as "The transaction hash when the block is sealed" and "A full receipt when a block is
  sealed" (:33-34).
- **Proposed change:** describe today's behavior, then one sentence: "An upcoming change makes
  both calls return sooner. Read the
  [transaction submission notice](/notices/transaction-submission-changes-notice)." Keep the
  current text in a draft, ready for the release.
- **Needs an SME:** confirm today's behavior for both calls, and whether the step's code links
  (pinned to `nitroVersionTag` `v3.12.4`, `content/vars.json:9`) show the old or the new code.

### 2. The docs define hard finality four ways

- **Where:** TSF:136 (Finalize on the parent chain). Docs pages listed below.
- **Problem:** the diagram calls `safe` and `finalized` hard finality, following
  `reference/finality-and-reorgs.mdx:29`. The finality track links the glossary, which requires
  the posting to be "itself final on the parent chain" (`content/glossary/hard-finality.mdx:6`).
  `deep-dives/finality.mdx:70` also says final. `deep-dives/batchposter.mdx:43` says hard finality
  starts when "the parent chain transaction confirms". `deep-dives/assertions.mdx:11` says
  "Assertions are what give Arbitrum its hard finality guarantee". Step 8 links that page.
- **Proposed change:** agree on one definition with an SME and align the five places. If it is
  `finalized`, TSF:136 becomes: "When the parent chain block that holds the batch is
  `finalized`, your transaction has hard finality. `safe` comes earlier. Only a deep parent chain
  reorg can revert a `safe` block."

### 3. When the waiting list becomes the priority queue

- **Where:** TSF:81 ("until the next … round starts"), TSF:91 ("When the round's execute phase
  starts"), PGAR:29 ("When a round starts").
- **Problem:** `priority-gas-auction/pga.mdx:85` says "At the start of each PGA round, the entire
  waiting list is transferred". The same page at :117-118 says intake "runs for the full round
  window" and the execute phase "begins as soon as intake closes. The waiting list moves into the
  priority queue".
- **Proposed change:** pick the two-phase model (`pga.mdx:117-118`) and use it in all four
  places. TSF:81: "Each round has two phases. During intake, the transaction waits in the
  Sequencer's waiting list. When intake closes, the execute phase starts." Fix `pga.mdx:85` to
  match.

### 4. The gas figure is a target, not a limit

- **Where:** PGAR:40, "the block reaches {var:arbOneBlockGasLimit} gas".
- **Problem:** `pga.mdx:124` calls 32 Mgas "the 32 Mgas gas limit target". `pga.mdx:128` says
  "The block hard limit is 64 Mgas".
- **Proposed change:** "the block reaches its gas target of {var:arbOneBlockGasLimit} gas".

### 5. Which node runs the pre-checks

- **Where:** TSF:62 ("Before the Sequencer admits the transaction to its queue, it runs
  pre-checks").
- **Problem:** the Nitro transaction flow diagram puts the checks on the full node
  (`diagrams/flows/transaction-lifecycle.md:25`: "The full node checks the transaction").
- **Needs an SME:** do both run them? If yes, TSF:62: "The RPC node and then the Sequencer run
  pre-checks." If not, fix the wrong diagram.

### 6. Settlement: withdrawals need a call, and a dispute adds time

- **Where:** TSF:159 (Settle).
- **Problem:** TSF:159 says confirmation sends the send root to the Outbox "so withdrawals from
  the blocks it covers can run". `deep-dives/l2-to-l1-messaging.mdx:35-36` says "anyone can
  execute the message … via `Outbox.executeTransaction`", and :53 says these messages "must be
  executed manually". On disputes, `deep-dives/assertions.mdx:58` says withdrawals "will be delayed
  by no more than two challenge periods".
- **Proposed change:** "If another assertion competes with it, a challenge decides which one
  confirms. A dispute delays withdrawals by at most two challenge periods. After confirmation,
  anyone can execute a withdrawal from those blocks on the parent chain with
  `Outbox.executeTransaction`."

### 7. Other pages

- `deep-dives/transaction-lifecycle.mdx:69`: "Your transactions connect to the Sequencer through
  the Sequencer Feed." The feed sends blocks out from the Sequencer. Nodes forward transactions
  in (`deep-dives/sequencer-transaction-flow.mdx:43`, "How transactions reach the Sequencer").
- `diagrams/flows/transaction-lifecycle.md:69` (Nitro transaction flow, Sequence step, failure
  Impact): "plus the Timeboost express lane advantage". `priority-gas-auction/pga.mdx:148` says
  Timeboost's express lane is decommissioned. Remove the clause, or ask an SME what replaced it.
- `content/glossary/batch-poster.mdx:6` calls the batch poster "an Externally Owned Account (EOA)
  controlled by the Sequencer", and `content/glossary/batch.mdx:6` says the Sequencer posts
  batches. `deep-dives/batchposter.mdx` describes the batch poster as its own Nitro component,
  which the diagram follows.
- `deep-dives/assertions.mdx:29`: "Arbitrum ensures assertions are automatically confirmed".
  Step 9 says "a validator confirms the assertion". Check with an SME which is right.

## Priority 2: clarity

### 8. Tell readers which finality level to wait for

- **Where:** the page intro, `content/docs/how-arbitrum-works/deep-dives/transaction-submission-flow.mdx:7`.
- **Why:** the diagram now shows a finality track on every step (Soft confirmation, Hard
  finality, Settlement), but nothing says which one an app should wait for.
- **Proposed text,** after the intro sentence:
  - **Soft confirmation** (`latest` tag): under a second. Good for showing activity, not for
    irreversible actions.
  - **Hard finality** (`finalized` tag): about 13 minutes on Ethereum. Wait for this before you
    credit a deposit or release funds.
  - **Settlement**: days. Matters only for messages to the parent chain, such as withdrawals.
- **Sources:** `reference/finality-and-reorgs.mdx:151-155` (what to wait for),
  `deep-dives/finality.mdx:32-34` (sub-second, "roughly 12–15 minutes", "on the order of days"),
  `reference/finality-and-reorgs.mdx:80` ("~13 min"). Use `<Term>` links for the three levels.

### 9. Give the time between steps

- TSF:114 (Publish the block): add "within a fraction of a second" (`finality.mdx:32`).
- TSF:136 (Finalize on the parent chain): add "about 13 minutes on Ethereum"
  (`finality-and-reorgs.mdx:80`).

### 10. Define "execute phase" and "priority" on the main path

- TSF:91 names "the round's execute phase" and "highest priority first". Neither is explained
  outside the detail view (PGAR:29 explains the priority fee). Item 3's wording defines the
  phases. For priority, add: "Priority is the priority fee per gas you set with
  `maxPriorityFeePerGas`."

### 11. Say that assertions do not wait for your batch

- **Where:** TSF:147 (Assert). The order of steps 7 and 8 reads as if the assertion waits for
  parent chain finality.
- **Source:** `reference/finality-and-reorgs.mdx:124-125`: assertions "are periodic settlement
  checkpoints"; batches "are posted continuously … not on the assertion cadence".
- **Proposed text:** "Every so often, a proposer posts one assertion that covers all batches
  since the last one."

### 12. Open the Settle step with who it matters to

- **Where:** TSF:159.
- **Source:** `deep-dives/finality.mdx:34`: full settlement is when "L2→L1 withdrawals can be
  executed".
- **Proposed text:** start with "Settlement matters only if your transaction sends a message to
  the parent chain, such as a withdrawal."

### 13. Tell app developers the Fast Feed does not affect them

- **Where:** TSF:102.
- **Source:** `priority-gas-auction/fast-feed.mdx:31`: "If you send ordinary transactions through
  a wallet or an app, the Fast Feed does not affect you."
- **Proposed text:** add "If you send transactions from a wallet or an app, the Fast Feed does not
  affect you."

### 14. Explain or drop "accumulator"

- **Where:** TSF:125 ("appends the batch to the Bridge's accumulator"). The edge label now reads
  "Accumulator entry".
- **Problem:** no glossary entry, and the docs mention it only in passing.
- **Proposed change:** one plain sentence on what the record is for, checked with an SME, or drop
  the sentence and the Bridge node from this path.

### 15. "Send root" or "Merkle root"

- **Where:** TSF:159 ("the assertion's send root"), edge label "Send root".
- **Problem:** `deep-dives/l2-to-l1-messaging.mdx:33` says "The assertion's Merkle root gets
  posted to the outbox". Pick one name, and if it is "send root", say what it is on first use.

### 16. Consider merging steps 2 and 3

- **Where:** TSF:72-91 and the detail view attached to step 2 (TSF:79,
  `detail: seq -> pga-round -> fast-feed`).
- **Problem:** the detail view opened from "Wait for the round" walks through execution (PGAR:40,
  "takes transactions from the queue into the block"), and step 3 repeats it (TSF:91). Both steps
  light only the Sequencer.
- **Proposed change:** one step, "Wait for the round, then execute", with the detail view
  attached. The Sync receipt text from TSF:91 moves into its own sentence group there.

## Priority 3: house style (`STYLE-GUIDE.md`)

| Where   | Problem                                                                                                                         | Rule                 | Proposed change                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------- |
| TSF:62  | Four conditions in one sentence ("A used nonce, too little balance, a fee cap error or a full queue returns an error at once.") | `STYLE-GUIDE.md:91`  | Split into two sentences, or a short list                                    |
| TSF:68  | Three conditions, 34 words                                                                                                      | `STYLE-GUIDE.md:91`  | Split                                                                        |
| PGAR:40 | Four stop conditions in one sentence                                                                                            | `STYLE-GUIDE.md:91`  | Split                                                                        |
| TSF:91  | Five sentences on four topics (ordering, Sync receipt, retraction, polling)                                                     | `STYLE-GUIDE.md:90`  | Split: ordering in one paragraph, the Sync receipt in another                |
| TSF:159 | Six sentences on five topics                                                                                                    | `STYLE-GUIDE.md:90`  | Split: what confirms, then what confirmation unlocks                         |
| TSF:68  | "can still be dropped": passive, no actor                                                                                       | `STYLE-GUIDE.md:39`  | "the Sequencer can still drop it"                                            |
| TSF:91  | "that receipt is retracted": passive, no actor                                                                                  | `STYLE-GUIDE.md:39`  | "the Sequencer retracts that receipt"                                        |
| TSF:62  | "RPC" not expanded on first use                                                                                                 | `STYLE-GUIDE.md:60`  | "remote procedure call (RPC) node"                                           |
| TSF:125 | "EIP-4844" not explained                                                                                                        | `STYLE-GUIDE.md:60`  | "EIP-4844 blobs (a cheaper kind of parent chain data)", or link the glossary |
| TSF:125 | "SequencerInbox" in prose; the glossary title is "Sequencer Inbox"                                                              | `STYLE-GUIDE.md:128` | "the Sequencer Inbox contract" in prose (the node keeps the contract name)   |
| TSF:136 | Condition after the action ("A finalized block reverts only if …")                                                              | `STYLE-GUIDE.md:43`  | Drop the sentence; `finality-and-reorgs.mdx` covers it                       |

## For engineering, not writers

- **Glossary links in step text.** The caption cannot link glossary terms today. Only the
  finality track links. Terms with glossary entries that the steps use: sequencer,
  priority-gas-auction, fast-feed, sequencer-feed, batch-poster, batch, sequencer-inbox, assertion,
  proposer, rollup-contract, challenge-period, outbox, arbos. This needs a term marker in the flow
  text and a renderer in the widget.

## Already fixed in the diagram (no writer action)

On the current branch, not yet merged:

- **Edge labels** name what travels: "Signed transaction", "Forwarded transaction", "Sequenced
  messages", "Compressed batch", "Accumulator entry", "Send root".
- **Node sub-lines** say what each node does: RPC node "Forwards to the Sequencer", Sequencer
  "Orders and executes", Batch poster "Posts batches", Fast Feed "Paid, streams each
  transaction" and Sequencer feed "Free, streams each block" (`fast-feed.mdx:106-113`: the Fast
  Feed is a paid subscription and publishes each transaction; the Sequencer feed is free and
  publishes each block), Proposer "Posts assertions".
- **Step 8 uses a Proposer node**, not "Validator" (`STYLE-GUIDE.md:58`). Its first sentence now
  says "A proposer".
- **Step 9 draws the Outbox**, with a "Send root" edge from the Rollup.
- **Step titles are verbs:** "Publish on the Fast Feed", "Publish the block", "Finalize on the
  parent chain".
- **Links:** step 1 now links "How transactions reach the Sequencer". Step 9 now links "Child to
  parent chain messaging" in place of "The reorg model", which is about reorgs. The Sequencer feed
  and RPC node nodes now preview their pages.
- **"Offchain"** lane label (`STYLE-GUIDE.md:141`). The Nitro flow's feed step now uses the same
  "Soft confirmation" badge as this diagram.
- **Design:** a finality track on every step, the step number on the node when a step has no
  edge, a "Look inside" chip on the Sequencer in step 2, and Show all folds the caption so the
  whole graph fits.
