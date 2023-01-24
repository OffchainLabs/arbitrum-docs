### How to verify the integrity of the Nitro database I currently have? {#how--to-verify-the-integrity-of-the-nitro-database-i-currently-have}

<p>We have an accumulator hash on all messages, which means that a message can't be added to the database without the previous message being correct. </p>

<p>To confirm that everything's working properly, you could just make sure that it's syncing and that the latest block is consistent with other Arbitrum nodes; e.g., you could check it against <a href="https://arbiscan.io">Arbiscan</a>  (note that Arbiscan's search field doesn't support searching by block hash).</p>

<p></p>

### How can I check if the node is running properly and diagnose the issue if it is not? {#how-can-i-check-if-the-node-is-running-properly-and-diagnose-the-issue-if-it-is-not}

<p>We have trace-level logging RPC request implemented on our node. You could use it to log all requests and responses at the trace level. (The performance impact of this should be negligible compared to the network overhead of an RPC request in the first place, especially considering that the request/response will only be serialized for logging if that log level is enabled.)</p>

<p></p>

### How do I run a node? {#how-do-i-run-a-node}

<p>See instructions <a href="https://developer.arbitrum.io/node-running/running-a-node">here</a>! </p>

<p></p>

### Can I run an Arbitrum Node in p2p mode? {#can-i-run-an-arbitrum-node-in-p2p-mode}

<p>Arbitrum doesn't have a consensus mechanism, so "p2p mode" doesn't apply. For nodes to sync to the latest chain state, they connect to an L1 node to sync the chain's history that's been posted in calldata and connect to the Sequencer feed for the transactions that have yet to be posted in batches. In no case do nodes need to peer up and sync with each other.</p>

### How do I read messages from the Sequencer feed? {#how-do-i-read-messages-from-the-sequencer-feed}

<p>An Arbitrum full node run as an <a href="https://developer.offchainlabs.com/node-running/running-a-node#arb-relay">Arb-Relay </a>can subscribe to the Sequencer feed at for real-time data as the Sequencer accepts and orders transactions off-chain. </p>

<p></p>

<p>When connected, you'll receive feed data that looks something like this:</p>

```typescript
{
  "version": 1,
  "messages": [{
    "sequenceNumber": 25757171,
    "message": {
      "message": {
        "header": {
          "kind": 3,
          "sender": "0xa4b000000000000000000073657175656e636572",
          "blockNumber": 16238523,
          "timestamp": 1671691403,
          "requestId": null,
          "baseFeeL1": null
        },
        "l2Msg": "BAL40oKksUiElQL5AISg7rsAgxb6o5SZbYNoIF2DTixsqDpD2xII9GJLG4C4ZAhh6N0AAAAAAAAAAAAAAAC7EQiq1R1VYgL3/oXgvD921hYRyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAArAAaAkebuEnSAUvrWVBGTxA7W+ZMNn5uyLlbOH7Nrs0bYOv6AOxQPqAo2UB0Z7vqlugjn+BUl0drDcWejBfDiPEC6jQA=="
      },
      "delayedMessagesRead": 354560
    },
    "signature": null
  }]
}
```

<p></p>

<p>Breaking this down a bit: the top-level data structure is defined by the<a href="https://github.com/OffchainLabs/nitro/blob/9b1e622102fa2bebfd7dffd327be19f8881f1467/broadcaster/broadcaster.go#L42"> BroadcastMessage struct:</a></p>

```typescript

type BroadcastMessage struct {
	Version int `json:"version"`
	// Note: "Messages" is slightly ambiguous naming since there are different types of messages
	Messages                       []*BroadcastFeedMessage         `json:"messages,omitempty"`
	ConfirmedSequenceNumberMessage *ConfirmedSequenceNumberMessage `json:"confirmedSequenceNumberMessage,omitempty"`
}
```

<p></p>

<p>The <code>messages</code> field is the <a href="https://github.com/OffchainLabs/nitro/blob/9b1e622102fa2bebfd7dffd327be19f8881f1467/broadcaster/broadcaster.go#L49">BroadcastFeedMessage struct:</a></p>

```typescript

type BroadcastFeedMessage struct {
	SequenceNumber arbutil.MessageIndex         `json:"sequenceNumber"`
	Message        arbstate.MessageWithMetadata `json:"message"`
	Signature      []byte                       `json:"signature"`
}
```

<p>Each <code>message</code> conforms to <a href="https://github.com/OffchainLabs/nitro/blob/a05f768d774f60468a58a6a94fcc1be18e4d8fae/arbstate/inbox.go#L42">arbstate.MessageWithMetadata</a>:</p>

```typescript

type MessageWithMetadata struct {
	Message             *arbos.L1IncomingMessage `json:"message"`
	DelayedMessagesRead uint64                   `json:"delayedMessagesRead"`
}
```

<p>Finally, we get the transaction's information in the <code>message</code> subfield as an<a href="https://github.com/OffchainLabs/nitro/blob/9b1e622102fa2bebfd7dffd327be19f8881f1467/arbos/incomingmessage.go#L61"> L1IncomingMessage</a>:</p>

```typescript
type L1IncomingMessage struct {
	Header *L1IncomingMessageHeader `json:"header"`
	L2msg  []byte                   `json:"l2Msg"`
	// Only used for `L1MessageType_BatchPostingReport`
	BatchGasCost *uint64 `json:"batchGasCost,omitempty" rlp:"optional"`
}
```

<p>In <a href="https://github.com/OffchainLabs/nitro/blob/9b1e622102fa2bebfd7dffd327be19f8881f1467/arbos/incomingmessage.go#L227">this file</a>, we can find a <code>ParseL2Transactions</code> function, which you can use this to decode the message.</p>

<p></p>

<p></p>

<p></p>

<p></p>

### How do I run a node locally for development? {#how-do-i-run-a-node-locally-for-development}

<p>See instructions <a href="https://developer.arbitrum.io/node-running/local-dev-node">here</a>.</p>

<p>We recommend running nitro nodes via docker; to compile directly / run without docker, you can follow the steps in this file then run the executable directly.</p>

<p></p>

<p></p>
