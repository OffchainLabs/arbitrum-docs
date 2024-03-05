---
title: 'How to read the sequencer feed'
description: Learn how to read the sequencer feed
sidebar_position: 9
content_type: how-to
todos:
  - Follow convention and style guide
  - Communicate "who this is for" and "under which scenarios this is useful".
  - Set expectations - prior knowledge, what to expect
  - Build supporting conceptual content
  - Align on what we want to treat as proper nouns vs common nouns
---

[Running an Arbitrum relay locally as a feed relay](/node-running/how-tos/running-a-feed-relay.mdx) lets you subscribe to an uncompressed sequencer feed for real-time data as the sequencer accepts and orders transactions off-chain.

When connected to websocket port `9642` of the local relay, you'll receive feed data that looks something like this:

```
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

Breaking this down a bit: the top-level data structure is defined by the [BroadcastMessage struct](https://github.com/OffchainLabs/nitro/blob/9b1e622102fa2bebfd7dffd327be19f8881f1467/broadcaster/broadcaster.go#L42):

```
type BroadcastMessage struct {
	Version int `json:"version"`
	// Note: "Messages" is slightly ambiguous naming since there are different types of messages
	Messages                       []*BroadcastFeedMessage         `json:"messages,omitempty"`
	ConfirmedSequenceNumberMessage *ConfirmedSequenceNumberMessage `json:"confirmedSequenceNumberMessage,omitempty"`
}
```

The `messages` field is the [BroadcastFeedMessage struct](https://github.com/OffchainLabs/nitro/blob/9b1e622102fa2bebfd7dffd327be19f8881f1467/broadcaster/broadcaster.go#L49):

```
type BroadcastFeedMessage struct {
	SequenceNumber arbutil.MessageIndex         `json:"sequenceNumber"`
	Message        arbstate.MessageWithMetadata `json:"message"`
	Signature      []byte                       `json:"signature"`
}
```

Each `message` conforms to [arbstate.MessageWithMetadata](https://github.com/OffchainLabs/nitro/blob/a05f768d774f60468a58a6a94fcc1be18e4d8fae/arbstate/inbox.go#L42):

```
type MessageWithMetadata struct {
	Message             *arbos.L1IncomingMessage `json:"message"`
	DelayedMessagesRead uint64                   `json:"delayedMessagesRead"`
}
```

Finally, we get the transaction's information in the `message` subfield as an [L1IncomingMessage](https://github.com/OffchainLabs/nitro/blob/9b1e622102fa2bebfd7dffd327be19f8881f1467/arbos/incomingmessage.go#L61):

```
type L1IncomingMessage struct {
	Header *L1IncomingMessageHeader `json:"header"`
	L2msg  []byte                   `json:"l2Msg"`
	// Only used for `L1MessageType_BatchPostingReport`
	BatchGasCost *uint64 `json:"batchGasCost,omitempty" rlp:"optional"`
}
```

In [this file](https://github.com/OffchainLabs/nitro/blob/9b1e622102fa2bebfd7dffd327be19f8881f1467/arbos/incomingmessage.go#L227), we can find a `ParseL2Transactions` function, which you can use this to decode the message.

### Using the feed relay, you can also calculate the corresponding `L2 block number` of a message:

On Arbitrum One, this can be done by adding the Arbitrum One genesis block number (22207817) to the sequence number of the feed message. It's important to note that in the case of Arbitrum Nova, the Nitro genesis number is 0, and therefore, there is no need to include it when adding to the feed message's sequence number.
