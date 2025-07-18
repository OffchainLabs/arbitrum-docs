// @ts-check
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const typedocSidebar = {
  items: [
    {
      type: 'category',
      label: 'AssetBridger',
      items: [
        {
          type: 'doc',
          id: 'sdk/assetBridger/assetBridger',
          label: 'Asset Bridger',
        },
        {
          type: 'doc',
          id: 'sdk/assetBridger/erc20Bridger',
          label: 'Erc20 Bridger',
        },
        {
          type: 'doc',
          id: 'sdk/assetBridger/ethBridger',
          label: 'Eth Bridger',
        },
        {
          type: 'doc',
          id: 'sdk/assetBridger/l1l3Bridger',
          label: 'L1l3 Bridger',
        },
      ],
    },
    {
      type: 'category',
      label: 'DataEntities',
      items: [
        {
          type: 'doc',
          id: 'sdk/dataEntities/address',
          label: 'Address',
        },
        {
          type: 'doc',
          id: 'sdk/dataEntities/constants',
          label: 'Constants',
        },
        {
          type: 'doc',
          id: 'sdk/dataEntities/errors',
          label: 'Errors',
        },
        {
          type: 'doc',
          id: 'sdk/dataEntities/event',
          label: 'Event',
        },
        {
          type: 'doc',
          id: 'sdk/dataEntities/message',
          label: 'Message',
        },
        {
          type: 'doc',
          id: 'sdk/dataEntities/networks',
          label: 'Networks',
        },
        {
          type: 'doc',
          id: 'sdk/dataEntities/retryableData',
          label: 'Retryable Data',
        },
        {
          type: 'doc',
          id: 'sdk/dataEntities/rpc',
          label: 'Rpc',
        },
        {
          type: 'doc',
          id: 'sdk/dataEntities/signerOrProvider',
          label: 'Signer Or Provider',
        },
        {
          type: 'doc',
          id: 'sdk/dataEntities/transactionRequest',
          label: 'Transaction Request',
        },
      ],
    },
    {
      type: 'category',
      label: 'Inbox',
      items: [
        {
          type: 'doc',
          id: 'sdk/inbox/inbox',
          label: 'Inbox',
        },
      ],
    },
    {
      type: 'category',
      label: 'Message',
      items: [
        {
          type: 'doc',
          id: 'sdk/message/ChildToParentMessage',
          label: 'Child To Parent Message',
        },
        {
          type: 'doc',
          id: 'sdk/message/ChildToParentMessageClassic',
          label: 'Child To Parent Message Classic',
        },
        {
          type: 'doc',
          id: 'sdk/message/ChildToParentMessageNitro',
          label: 'Child To Parent Message Nitro',
        },
        {
          type: 'doc',
          id: 'sdk/message/ChildTransaction',
          label: 'Child Transaction',
        },
        {
          type: 'doc',
          id: 'sdk/message/ParentToChildMessage',
          label: 'Parent To Child Message',
        },
        {
          type: 'doc',
          id: 'sdk/message/ParentToChildMessageCreator',
          label: 'Parent To Child Message Creator',
        },
        {
          type: 'doc',
          id: 'sdk/message/ParentToChildMessageGasEstimator',
          label: 'Parent To Child Message Gas Estimator',
        },
        {
          type: 'doc',
          id: 'sdk/message/ParentTransaction',
          label: 'Parent Transaction',
        },
      ],
    },
    {
      type: 'category',
      label: 'Utils',
      items: [
        {
          type: 'doc',
          id: 'sdk/utils/arbProvider',
          label: 'Arb Provider',
        },
        {
          type: 'doc',
          id: 'sdk/utils/byte_serialize_params',
          label: 'Byte_serialize_params',
        },
        {
          type: 'doc',
          id: 'sdk/utils/eventFetcher',
          label: 'Event Fetcher',
        },
        {
          type: 'doc',
          id: 'sdk/utils/lib',
          label: 'Lib',
        },
        {
          type: 'doc',
          id: 'sdk/utils/multicall',
          label: 'Multicall',
        },
        {
          type: 'doc',
          id: 'sdk/utils/types',
          label: 'Types',
        },
      ],
    },
  ],
};
module.exports = { sdkSidebar: typedocSidebar.items };
