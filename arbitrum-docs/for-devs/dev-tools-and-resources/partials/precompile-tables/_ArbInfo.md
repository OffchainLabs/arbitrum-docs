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
          href="https://github.com/OffchainLabs/nitro-contracts/blob/9a6bfad2363322099d399698751551ff044c7a72/src/precompiles/ArbInfo.sol#L11"
          target="_blank"
        >
          Interface
        </a>
      </td>
      <td>
        <a
          href="https://github.com/OffchainLabs/nitro/blob/v2.2.5/precompiles/ArbInfo.go#L17"
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
          href="https://github.com/OffchainLabs/nitro-contracts/blob/9a6bfad2363322099d399698751551ff044c7a72/src/precompiles/ArbInfo.sol#L14"
          target="_blank"
        >
          Interface
        </a>
      </td>
      <td>
        <a
          href="https://github.com/OffchainLabs/nitro/blob/v2.2.5/precompiles/ArbInfo.go#L25"
          target="_blank"
        >
          Implementation
        </a>
      </td>
      <td>GetCode retrieves a contract's deployed code</td>
    </tr>
  </tbody>
</table>
