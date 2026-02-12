## Type Aliases

### PercentIncrease

```ts
type PercentIncrease = object;
```

Defined in: message/ParentToChildMessageGasEstimator.ts:43

An optional big number percentage increase

#### Properties

| Property                                          | Type        | Description                                                                    | Defined in                                     |
| ------------------------------------------------- | ----------- | ------------------------------------------------------------------------------ | ---------------------------------------------- |
| <a id="base"></a> `base?`                         | `BigNumber` | If provided, will override the estimated base                                  | message/ParentToChildMessageGasEstimator.ts:47 |
| <a id="percentincrease-1"></a> `percentIncrease?` | `BigNumber` | How much to increase the base by. If not provided system defaults may be used. | message/ParentToChildMessageGasEstimator.ts:52 |
