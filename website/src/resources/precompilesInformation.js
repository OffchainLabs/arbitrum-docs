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
    },
  },
  ArbOwnerPublic: {},
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
};

module.exports = precompilesInformation;
