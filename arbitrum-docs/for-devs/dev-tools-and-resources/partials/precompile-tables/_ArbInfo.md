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
        <code>getBalance(address account)</code>
      </td>
      <td>
        <a
          href="https://github.com/OffchainLabs/nitro-contracts/blob/61204dd455966cb678192427a07aa9795ff91c14/src/precompiles/ArbInfo.sol#L11"
          target="_blank"
        >
          Interface
        </a>
      </td>
      <td>
        <a
          href="https://github.com/OffchainLabs/nitro/blob/v3.1.0/precompiles/ArbInfo.go#L17"
          target="_blank"
        >
          Implementation
        </a>
      </td>
      <td>GetBalance retrieves an account's balance</td>
    </tr>
    <tr>
      <td>
        <code>getCode(address account)</code>
      </td>
      <td>
        <a
          href="https://github.com/OffchainLabs/nitro-contracts/blob/61204dd455966cb678192427a07aa9795ff91c14/src/precompiles/ArbInfo.sol#L14"
          target="_blank"
        >
          Interface
        </a>
      </td>
      <td>
        <a
          href="https://github.com/OffchainLabs/nitro/blob/v3.1.0/precompiles/ArbInfo.go#L25"
          target="_blank"
        >
          Implementation
        </a>
      </td>
      <td>GetCode retrieves a contract's deployed code</td>
    </tr>
  </tbody>
</table>
