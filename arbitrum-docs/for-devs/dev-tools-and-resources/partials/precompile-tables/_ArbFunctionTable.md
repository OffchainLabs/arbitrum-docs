<table>
  <thead>
    <tr>
      <th>Method</th>
      <th>Solidity interface</th>
      <th>Go implementation</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <code>upload(bytes calldata buf)</code>
      </td>
      <td>
        <a
          href="https://github.com/OffchainLabs/nitro-contracts/blob/7396313311ab17cb30e2eef27cccf96f0a9e8f7f/src/precompiles/ArbFunctionTable.sol#L15"
          target="_blank"
        >
          Interface
        </a>
      </td>
      <td>
        <a
          href="https://github.com/OffchainLabs/nitro/blob/v3.2.1/precompiles/ArbFunctionTable.go#L19"
          target="_blank"
        >
          Implementation
        </a>
      </td>
      <td>Upload does nothing</td>
    </tr>
    <tr>
      <td>
        <code>size(address addr)</code>
      </td>
      <td>
        <a
          href="https://github.com/OffchainLabs/nitro-contracts/blob/7396313311ab17cb30e2eef27cccf96f0a9e8f7f/src/precompiles/ArbFunctionTable.sol#L18"
          target="_blank"
        >
          Interface
        </a>
      </td>
      <td>
        <a
          href="https://github.com/OffchainLabs/nitro/blob/v3.2.1/precompiles/ArbFunctionTable.go#L24"
          target="_blank"
        >
          Implementation
        </a>
      </td>
      <td>Size returns the empty table's size, which is 0</td>
    </tr>
    <tr>
      <td>
        <code>get(address addr, uint256 index)</code>
      </td>
      <td>
        <a
          href="https://github.com/OffchainLabs/nitro-contracts/blob/7396313311ab17cb30e2eef27cccf96f0a9e8f7f/src/precompiles/ArbFunctionTable.sol#L21"
          target="_blank"
        >
          Interface
        </a>
      </td>
      <td>
        <a
          href="https://github.com/OffchainLabs/nitro/blob/v3.2.1/precompiles/ArbFunctionTable.go#L29"
          target="_blank"
        >
          Implementation
        </a>
      </td>
      <td>Get reverts since the table is empty</td>
    </tr>
  </tbody>
</table>
