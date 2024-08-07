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
      addbatchposter: {
        description: 'Adds newBatchPoster as a batch poster',
      },
      gettxbasefee: {
        description: 'Deprecated: returns 0',
        deprecated: true,
      },
      settxbasefee: {
        description: 'Deprecated: does nothing',
        deprecated: true,
      },
    },
  },
  ArbDebug: {
    methodOverrides: {
      events: {
        description: 'Emit events with values based on the args provided',
      },
      eventsview: {
        description: 'Tries (and fails) to emit logs in a view context',
      },
      customrevert: {
        description: 'Throws a custom error',
      },
      legacyerror: {
        description: 'Throws a hardcoded error',
      },
    },
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
      getl1pricingsurplus: {
        description: 'Returns the surplus of funds for L1 batch posting payments (may be negative)',
      },
      getpricinginertia: {
        description:
          'Returns how slowly ArbOS updates the L2 basefee in response to backlogged gas',
      },
      getperbatchgascharge: {
        description:
          'Returns the base charge (in L1 gas) attributed to each data batch in the calldata pricer',
      },
      getamortizedcostcapbips: {
        description: 'Returns the cost amortization cap in basis points',
      },
      getl1feesavailable: {
        description: 'Returns the available funds from L1 fees',
      },
      getl1pricingequilibrationunits: {
        description:
          'Returns the equilibration units parameter for L1 price adjustment algorithm (Available since ArbOS 20)',
      },
      getlastl1pricingupdatetime: {
        description:
          'Returns the last time the L1 calldata pricer was updated (Available since ArbOS 20)',
      },
      getl1pricingfundsdueforrewards: {
        description:
          'Returns the amount of L1 calldata payments due for rewards (per the L1 reward rate) (Available since ArbOS 20)',
      },
      getl1pricingunitssinceupdate: {
        description:
          'Returns the amount of L1 calldata posted since the last update (Available since ArbOS 20)',
      },
      getlastl1pricingsurplus: {
        description:
          'Returns the L1 pricing surplus as of the last update (may be negative) (Available since ArbOS 20)',
      },
    },
  },
  ArbInfo: {},
  ArbOwner: {
    methodOverrides: {
      setl1pricingequilibrationunits: {
        description: 'Sets equilibration units parameter for L1 price adjustment algorithm',
      },
      setl1pricinginertia: {
        description: 'Sets inertia parameter for L1 price adjustment algorithm',
      },
      setl1pricingrewardrecipient: {
        description: 'Sets reward recipient address for L1 price adjustment algorithm',
      },
      setl1pricingrewardrate: {
        description: 'Sets reward amount for L1 price adjustment algorithm, in wei per unit',
      },
      setl1priceperunit: {
        description: 'Set how much ArbOS charges per L1 gas spent on transaction data.',
      },
      setperbatchgascharge: {
        description:
          'Sets the base charge (in L1 gas) attributed to each data batch in the calldata pricer',
      },
      setamortizedcostcapbips: {
        description: 'Sets the cost amortization cap in basis points',
      },
      releasel1pricersurplusfunds: {
        description: 'Releases surplus funds from L1PricerFundsPoolAddress for use',
      },
      setbrotlicompressionlevel: {
        description:
          'Sets the Brotli compression level used for fast compression (Available in ArbOS version 12 with default level as 1)',
      },
      setchainconfig: {
        description: 'Sets serialized chain config in ArbOS state',
      },
    },
  },
  ArbOwnerPublic: {
    methodOverrides: {
      rectifychainowner: {
        description:
          'RectifyChainOwner checks if the account is a chain owner (Available in ArbOS version 11)',
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
      submitretryable: {
        description:
          'Do not call. This method represents a retryable submission to aid explorers. Calling it will always revert.',
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
  ArbWasm: {},
  ArbWasmCache: {},
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
