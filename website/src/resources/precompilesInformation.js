const precompilesInformation = {
  ArbAddressTable: {},
  ArbAggregator: {
    methodOverrides: {
      getpreferredaggregator: {
        deprecated: true,
      },
      getdefaultaggregator: {
        deprecated: true,
      },
      gettxbasefee: {
        deprecated: true,
      },
      settxbasefee: {
        deprecated: true,
      },
    },
  },
  ArbDebug: {
    eventOverrides: {
      basic: {
        description: 'Emitted in <code>Events</code> for testing',
      },
      mixed: {
        description: 'Emitted in <code>Events</code> for testing',
      },
      store: {
        description: 'Never emitted (used for testing log sizes)',
      },
    },
  },
  ArbFunctionTable: {},
  ArbGasInfo: {
    methodOverrides: {
      getcurrenttxl1gasfees: {
        description:
          'GetCurrentTxL1GasFees gets the fee in wei paid to the batch poster for posting this tx',
      },
      GetL1PricingEquilibrationUnits: {
        availableSinceArbOS: 20,
      },
      GetLastL1PricingUpdateTime: {
        availableSinceArbOS: 20,
      },
      GetL1PricingFundsDueForRewards: {
        availableSinceArbOS: 20,
      },
      GetL1PricingUnitsSinceUpdate: {
        availableSinceArbOS: 20,
      },
      GetLastL1PricingSurplus: {
        availableSinceArbOS: 20,
      },
    },
  },
  ArbInfo: {},
  ArbOwner: {
    methodOverrides: {
      setBrotliCompressionLevel: {
        description:
          'Sets the Brotli compression level used for fast compression (default level is 1)',
      },
    },
  },
  ArbOwnerPublic: {
    methodOverrides: {
      RectifyChainOwner: {
        availableSinceArbOS: 11,
      },
    },
    eventOverrides: {
      chainownerrectified: {
        description: 'Emitted when verifying a chain owner',
      },
    },
  },
  ArbosTest: {},
  ArbRetryableTx: {
    methodOverrides: {
      getcurrentredeemer: {
        description: 'Gets the redeemer of the current retryable redeem attempt',
      },
    },
    eventOverrides: {
      ticketcreated: {
        description: 'Emitted when creating a retryable',
      },
      lifetimeextended: {
        description: "Emitted when extending a retryable's expiry date",
      },
      redeemscheduled: {
        description: 'Emitted when scheduling a retryable',
      },
      canceled: {
        description: 'Emitted when cancelling a retryable',
      },
      redeemed: {
        description:
          'DEPRECATED in favour of new <code>RedeemScheduled</code> event after the nitro upgrade.',
      },
    },
  },
  ArbStatistics: {},
  ArbSys: {
    eventOverrides: {
      l2tol1tx: {
        description: 'Logs a send transaction from L2 to L1, including data for outbox proving',
      },
      l2tol1transaction: {
        description:
          'DEPRECATED in favour of the new <code>L2ToL1Tx</code> event above after the nitro upgrade',
      },
      sendmerkleupdate: {
        description: 'Logs a new merkle branch needed for constructing outbox proofs',
      },
    },
  },
  ArbWasm: {
    eventOverrides: {
      programactivated: {
        description: 'Emitted when activating a WASM program',
      },
      programlifetimeextended: {
        description: 'Emitted when extending the expiration date of a WASM program',
      },
    },
  },
  ArbWasmCache: {
    eventOverrides: {
      updateprogramcache: {
        description: 'Emitted when caching a WASM program',
      },
    },
  },
};

const nodeInterfaceInformation = {
  methodOverrides: {
    estimateretryableticket: {
      signature:
        'estimateRetryableTicket(address sender, uint256 deposit, address to, uint256 l2CallValue, address excessFeeRefundAddress, address callValueRefundAddress, bytes calldata data)',
      description: 'Estimates the gas needed for a retryable submission',
    },
    constructoutboxproof: {
      description:
        "Constructs an outbox proof of an l2->l1 send's existence in the outbox accumulator",
    },
    findbatchcontainingblock: {
      description: 'Finds the L1 batch containing a requested L2 block, reverting if none does',
    },
    getl1confirmations: {
      description:
        'Gets the number of L1 confirmations of the sequencer batch producing the requested L2 block',
    },
    gasestimatecomponents: {
      signature: 'gasEstimateComponents(address to, bool contractCreation, bytes calldata data)',
      description: 'Same as native gas estimation, but with additional info on the l1 costs',
    },
    gasestimatel1component: {
      signature: 'gasEstimateL1Component(address to, bool contractCreation, bytes calldata data)',
      description: "Estimates a transaction's l1 costs",
    },
    legacylookupmessagebatchproof: {
      description: 'Returns the proof necessary to redeem a message',
    },
    nitrogenesisblock: {
      description: 'Returns the first block produced using the Nitro codebase',
    },
    blockl1num: {
      description: 'Returns the L1 block number of the L2 block',
    },
    l2blockrangeforl1: {
      description: 'Finds the L2 block number range that has the given L1 block number',
    },
  },
};

module.exports = {
  precompilesInformation,
  nodeInterfaceInformation,
};
