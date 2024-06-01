[Documentation](../README.md) / utils/erc20

## Functions

### approve()

```ts
function approve(__namedParameters: ApproveProps): Promise<TransactionReceipt>
```

Approve transfers a specified amount of tokens from the owner's account to
the spender's account.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `ApproveProps` |

#### Returns

`Promise`\<`TransactionReceipt`\>

#### Source

[src/utils/erc20.ts:54](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/utils/erc20.ts#L54)

***

### approvePrepareTransactionRequest()

```ts
function approvePrepareTransactionRequest(__namedParameters: ApprovePrepareTransactionRequestProps): Promise<PrepareTransactionRequestReturnType>
```

ApprovePrepareTransactionRequest prepares a transaction request to approve
spending a specific amount of tokens by a designated spender on behalf of the
token owner.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `ApprovePrepareTransactionRequestProps` |

#### Returns

`Promise`\<`PrepareTransactionRequestReturnType`\>

#### Source

[src/utils/erc20.ts:26](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/utils/erc20.ts#L26)

***

### fetchAllowance()

```ts
function fetchAllowance(__namedParameters: FetchAllowanceProps): Promise<bigint>
```

Fetches the allowance amount for a specified owner and spender address from
the ERC20 token contract at the given address.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `FetchAllowanceProps` |

#### Returns

`Promise`\<`bigint`\>

#### Source

[src/utils/erc20.ts:90](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/utils/erc20.ts#L90)

***

### fetchDecimals()

```ts
function fetchDecimals(__namedParameters: object): Promise<number>
```

Returns the number of decimals for a specified ERC20 token at the given
address using the provided PublicClient.

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `__namedParameters` | `object` |
| `__namedParameters.address` | \`0x$\{string\}\` |
| `__namedParameters.publicClient` | `object` |

#### Returns

`Promise`\<`number`\>

#### Source

[src/utils/erc20.ts:108](https://github.com/anegg0/arbitrum-orbit-sdk/blob/763a3f41e7ea001cbb6fe81ac11cc794b4a0f94d/src/utils/erc20.ts#L108)
