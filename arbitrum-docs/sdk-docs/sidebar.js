// @ts-check
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const typedocSidebar = {
  "items": [
    {
      "type": "doc",
      "id": "sdk-docs/index",
      "label": "Index"
    },
    {
      "type": "category",
      "label": "AssetBridger",
      "items": [
        {
          "type": "doc",
          "id": "sdk-docs/assetBridger/assetBridger",
          "label": "AssetBridger"
        },
        {
          "type": "doc",
          "id": "sdk-docs/assetBridger/erc20Bridger",
          "label": "Erc20Bridger"
        },
        {
          "type": "doc",
          "id": "sdk-docs/assetBridger/ethBridger",
          "label": "EthBridger"
        }
      ]
    },
    {
      "type": "category",
      "label": "DataEntities",
      "items": [
        {
          "type": "doc",
          "id": "sdk-docs/dataEntities/address",
          "label": "Address"
        },
        {
          "type": "doc",
          "id": "sdk-docs/dataEntities/constants",
          "label": "Constants"
        },
        {
          "type": "doc",
          "id": "sdk-docs/dataEntities/errors",
          "label": "Errors"
        },
        {
          "type": "doc",
          "id": "sdk-docs/dataEntities/event",
          "label": "Event"
        },
        {
          "type": "doc",
          "id": "sdk-docs/dataEntities/message",
          "label": "Message"
        },
        {
          "type": "doc",
          "id": "sdk-docs/dataEntities/networks",
          "label": "Networks"
        },
        {
          "type": "doc",
          "id": "sdk-docs/dataEntities/retryableData",
          "label": "RetryableData"
        },
        {
          "type": "doc",
          "id": "sdk-docs/dataEntities/rpc",
          "label": "Rpc"
        },
        {
          "type": "doc",
          "id": "sdk-docs/dataEntities/signerOrProvider",
          "label": "SignerOrProvider"
        },
        {
          "type": "doc",
          "id": "sdk-docs/dataEntities/transactionRequest",
          "label": "TransactionRequest"
        }
      ]
    },
    {
      "type": "category",
      "label": "Inbox",
      "items": [
        {
          "type": "doc",
          "id": "sdk-docs/inbox/inbox",
          "label": "Inbox"
        }
      ]
    },
    {
      "type": "category",
      "label": "Message",
      "items": [
        {
          "type": "doc",
          "id": "sdk-docs/message/L1ToL2Message",
          "label": "L1ToL2Message"
        },
        {
          "type": "doc",
          "id": "sdk-docs/message/L1ToL2MessageCreator",
          "label": "L1ToL2MessageCreator"
        },
        {
          "type": "doc",
          "id": "sdk-docs/message/L1ToL2MessageGasEstimator",
          "label": "L1ToL2MessageGasEstimator"
        },
        {
          "type": "doc",
          "id": "sdk-docs/message/L1Transaction",
          "label": "L1Transaction"
        },
        {
          "type": "doc",
          "id": "sdk-docs/message/L2ToL1Message",
          "label": "L2ToL1Message"
        },
        {
          "type": "doc",
          "id": "sdk-docs/message/L2ToL1MessageClassic",
          "label": "L2ToL1MessageClassic"
        },
        {
          "type": "doc",
          "id": "sdk-docs/message/L2ToL1MessageNitro",
          "label": "L2ToL1MessageNitro"
        },
        {
          "type": "doc",
          "id": "sdk-docs/message/L2Transaction",
          "label": "L2Transaction"
        }
      ]
    },
    {
      "type": "category",
      "label": "Utils",
      "items": [
        {
          "type": "doc",
          "id": "sdk-docs/utils/arbProvider",
          "label": "ArbProvider"
        },
        {
          "type": "doc",
          "id": "sdk-docs/utils/byte_serialize_params",
          "label": "Byte_serialize_params"
        },
        {
          "type": "doc",
          "id": "sdk-docs/utils/eventFetcher",
          "label": "EventFetcher"
        },
        {
          "type": "doc",
          "id": "sdk-docs/utils/lib",
          "label": "Lib"
        },
        {
          "type": "doc",
          "id": "sdk-docs/utils/multicall",
          "label": "Multicall"
        },
        {
          "type": "doc",
          "id": "sdk-docs/utils/types",
          "label": "Types"
        }
      ]
    }
  ]
};
module.exports = typedocSidebar.items;