---
title: "How to customize your Orbit chain's precompile"
sidebar_label: "Customize your chain's precompile"
description: "Learn how (and when) to customize your Orbit chain's precompile"
author: jasonwan
sidebar_position: 2
---

import PublicPreviewBannerPartial from '../partials/_orbit-public-preview-banner-partial.md';

<PublicPreviewBannerPartial />

import UnderConstructionPartial from '../../partials/_under-construction-banner-partial.md';

<UnderConstructionPartial />

There are 2 ways to customize your own precompile:

 1. Add your method logic to an existing [precompile](https://github.com/OffchainLabs/nitro-contracts/tree/97cfbe00ff0eea4d7f5f5f3afb01598c19ddabc4/src/precompiles).
 2. Create a new precompile.

### Prerequisites

Clone the Nitro repository before you begin:

```shell
git clone <https://github.com/OffchainLabs/nitro.git>
cd nitro
git submodule update --init --recursive --force
```

## Option 1: Add new methods to existing precompile

First you need to go to [precompiles/](https://github.com/OffchainLabs/nitro/tree/master/precompiles), and vi one of the existing precompile (let’s use ArbSys.sol as an example), then `vi ArbSys.go`, now we can add a simple `SayHi` to it:

```go
func (con *ArbSys) SayHi(c ctx, evm mech) (string, error) {
	return "hi", nil
}
```

Then, find the corresponding Solidity file (in this case, `ArbSys.sol`) in [contracts/src/precompiles/](https://github.com/OffchainLabs/nitro-contracts/tree/97cfbe00ff0eea4d7f5f5f3afb01598c19ddabc4/src/precompiles) and add the related interface to it. Ensure that the method name on the interface matches the name of the function you introduced in the previous step, `camelCased`:

```solidity
function sayHi() external view returns(string memory);
```

Now we can build the nitro by following [this](https://docs.arbitrum.io/node-running/how-tos/build-nitro-locally) docs. (Note if you have already built the docker image, you still need run last step to build again)
Run nitro following this [guide](https://docs.arbitrum.io/node-running/how-tos/running-a-full-node#putting-it-all-together).

When it is ready, we can call our new `ArbSys.sol`.

#### Use curl to make call directly

```shell
curl Your_IP_Address:8547\
-X POST \
-H "Content-Type: application/json" \
--data '{"method":"eth_call","params":[{"from":null,"to":"0x0000000000000000000000000000000000000064","data":"0x0c49c36c"}, "latest"],"id":1,"jsonrpc":"2.0"}'
```

You can now see:

```
{"jsonrpc":"2.0","id":1,"result":"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000026869000000000000000000000000000000000000000000000000000000000000"}
```

Which the `0x6869` is the hexify utf8 decode of `hi`

#### Use foundry `cast call`:

```
cast call 0x0000000000000000000000000000000000000064 "sayHi()(string)”
```

You can now see:

```
hi
```

## Option 2: Create a new precompile

First you need to go to [precompiles/](https://github.com/OffchainLabs/nitro/tree/master/precompiles) , and create a new precompile (let’s use ArbSys.sol as an example), we named ArbHi: `vi ArbHi.go`, and give it address `0x11a` for examples, like this:

```go
package precompiles

// ArbGasInfo provides insight into the cost of using the rollup.
type ArbHi struct {
	Address addr // 0x11a
}

func (con *ArbHi) SayHi(c ctx, evm mech) (string, error) {
	return "hi", nil
}
```

Then edit [precompile.go](https://github.com/OffchainLabs/nitro/blob/master/precompiles/precompile.go), we need to register the new precompile under method `Precompiles()`:

```go
insert(MakePrecompile(templates.ArbHiMetaData, &ArbHi{Address: hex("11a")})) // You can set it to other address, we sue 0x011a here as an example
```

Go to [contracts/src/precompiles/](https://github.com/OffchainLabs/nitro-contracts/tree/97cfbe00ff0eea4d7f5f5f3afb01598c19ddabc4/src/precompiles) and create `ArbHi.sol`, we can add the related interface to it (you need to make sure their method/contract name are same):

```solidity
pragma solidity >=0.4.21 <0.9.0;

/// @title Say hi.
/// @notice just for test
/// Precompiled contract that exists in every Arbitrum chain at 0x000000000000000000000000000000000000011a.
interface ArbHi {
    function sayHi() external view returns(string memory);
}
```

Now we can build the nitro by following [this](https://docs.arbitrum.io/node-running/how-tos/build-nitro-locally) docs. (Note if you have already built the docker image, you still need run last step to build again).

When it is ready, we can call our new `ArbHi.sol`.

#### Use curl to make call directly

```shell
curl Your_IP_Address:8547 \
-X POST \
-H "Content-Type: application/json" \
--data '{"method":"eth_call","params":[{"from":null,"to":"0x000000000000000000000000000000000000011a","data":"0x0c49c36c"}, "latest"],"id":1,"jsonrpc":"2.0"}'
```

You should see something like this:

```
{"jsonrpc":"2.0","id":1,"result":"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000026869000000000000000000000000000000000000000000000000000000000000"}
```

#### Use foundry `cast call`:

```
cast call 0x000000000000000000000000000000000000011a "sayHi()(string)”
```

You can now see:

```
hi
```
