---
author: dzgoldman
---

# Inside AnyTrust

AnyTrust is a variant of Arbitrum Nitro technology that lowers costs by accepting a mild trust assumption.

The Arbitrum protocol requires that all Arbitrum nodes, including validators (nodes that verify correctness of the chain and are prepared to stake on correct results), have access to the data of every L2 transaction in the Arbitrum chain's inbox. An Arbitrum rollup provides data access by posting the data (in batched, compressed form) on L1 Ethereum as calldata. The Ethereum gas to pay for this is the largest component of cost in Arbitrum.

AnyTrust relies instead on an external Data Availability Committee (hereafter, "the Committee") to store data and provide it on demand. The Committee has `N` members, of which AnyTrust assumes at least two are honest. This means that if `N - 1` Committee members promise to provide access to some data, at least one of the promising parties must be honest. Since there are two honest members, and only one failed to make the promise, it follows that at least one of the promisers must be honest — and that honest member will provide data when it is needed to ensure the chain can properly function.

## Keysets

A Keyset specifies the BLS public keys of Committee members and the number of signatures required for a Data Availability Certificate to be valid. Keysets make Committee membership changes possible and provide Committee members the ability to change their keys.

A Keyset contains:

- the number of Committee members, and
- for each Committee member, a BLS public key, and
- the number of Committee signatures required.

Keysets are identified by their hashes.

The SequencerInbox contract maintains `dasKeySetInfo` mapping with embedded [access controls](https://github.com/OffchainLabs/nitro-contracts/blob/fbbcef09c95f69decabaced3da683f987902f3e2/src/bridge/SequencerInbox.sol#L750-L778) for adding new keysets and invalidating existing ones. Upon addition, a L1 system contract [event](https://github.com/OffchainLabs/nitro-contracts/blob/fbbcef09c95f69decabaced3da683f987902f3e2/src/bridge/ISequencerInbox.sol#L197-L201) containing the Keyset's hash and full contents is emitted and processed by the L2 chain during [validation](https://github.com/Layr-Labs/nitro/blob/eigenda-v3.2.1/arbstate/daprovider/util.go#L194).

Although the API does not limit the number of active Keysets that can be valid at the same time, normally only one Keyset will be valid.

## Data Availability Certificates

A central concept in AnyTrust is the Data Availability Certificate (hereafter, a "DACert"). A [DACert](https://github.com/Layr-Labs/nitro/blob/eigenda-v3.2.1/arbstate/daprovider/util.go#L239-L246) contains:

- the hash of a data block, and
- an expiration time, and
- proof that N-1 Committee members have signed the (hash, expiration time) pair, consisting of:
  - the hash of the Keyset used in signing, and
  - a bitmap saying which Committee members signed, and
  - an aggregated BLS signature (over the BLS12-381 curve) proving that those parties signed.

Because of the `1-of-N` trust assumption, a DACert constitutes proof that the batch data (i.e., the preimage of the hash in the DACert) will be available from at least one honest Committee member, at least until the expiration time.

The hashes of the data blocks are committed by the L1 chain's Sequencer Inbox contract, allowing the data to be reliably read by L2 chain nodes.

AnyTrust gives the sequencer an additional way to post batches to the L1 chain. The L1 Sequencer Inbox contract will reject any DACert that uses an invalid Keyset; other certificate validity checks are enforced during derivation. 

The L2 code that reads data from the inbox reads a full-data block as in ordinary Nitro. If it sees a DACert instead, it checks the validity of the DACert, with reference to the Keyset specified by the DACert (which is known to be valid since the Sequencer Inbox verified that). The L2 chain code verifies that:

- the number of signers is at least the number required by the Keyset, and
- the aggregated signature is valid for the claimed signers, and
- the expiration time is at least two weeks after the current L2 timestamp.

If the DACert is invalid, the L2 code discards the DACert and moves on to the next data block. If the DACert is valid, the L2 code reads the data block, which is guaranteed to be available because the DACert is valid. There are no significant changes to fraud proving since these validations are compiled into the wasm replay script - removing the need for additional opcodes or changes to one step proving for a `READSEQUENCERINBOX` opcode.

## Data Availability Servers

Committee members run Data Availability Server (DAS) software. The DAS exposes two APIs:

- The Sequencer API, which is meant to be called only by the Arbitrum chain's Sequencer, is a JSON-RPC interface allowing the Sequencer to submit data blocks to the DAS for storage. Deployments will typically block access to this API from callers other than the Sequencer.
- The REST API, which is meant to be available to the world, is a RESTful HTTP(S) based protocol that allows data blocks to be fetched by hash. This API is fully cacheable, and deployments may use a caching proxy or CDN to increase scale and protect against DoS attacks.

Only Committee members have reason to support the Sequencer API. We expect others to run the REST API, and that is helpful. (More on that below.)

The DAS software, based on configuration options, can store its data in local files, or in a Badger database, or on Amazon S3, or redundantly across multiple backing stores. The software also supports optional caching in memory (using Bigcache) or in a Redis instance.

## Sequencer-Committee Interaction

When the Arbitrum sequencer produces a data batch that it wants to post using the Committee, it sends the batch's data, along with an expiration time (normally three weeks in the future) via RPC to all Committee members in parallel. Each Committee member stores the data in its backing store, indexed by the data's hash. Then the member signs the (hash, expiration time) pair using its BLS key, and returns the signature with a success indicator to the sequencer.

Once the Sequencer has collected enough signatures, it can aggregate the signatures and create a valid DACert for the (hash, expiration time) pair. The Sequencer then posts that DACert to the L1 inbox contract, making it available to the AnyTrust chain software at L2.

If the Sequencer fails to collect enough signatures within a few minutes, it will abandon the attempt to use the Committee, and will "fall back to rollup" by posting the full data directly to the L1 chain, as it would do in a non-AnyTrust chain. The Nitro software can understand both data posting formats (via DACert or via native Ethereum DA) and will handle each one correctly.
