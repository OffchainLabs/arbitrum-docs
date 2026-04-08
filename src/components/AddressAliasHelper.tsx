import React, { useEffect, useState } from 'react';

const ADDRESS_ALIAS_OFFSET = 0x1111000000000000000000000000000000001111n;
const ADDRESS_BIT_LENGTH = 160;

function applyAlias(address: string): string {
  const addr = BigInt(address);
  const aliased = BigInt.asUintN(ADDRESS_BIT_LENGTH, addr + ADDRESS_ALIAS_OFFSET);
  return '0x' + aliased.toString(16).padStart(40, '0');
}

function isAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value);
}

export const AddressAliasHelper = () => {
  const [l1Address, setL1Address] = useState('');
  const [l2Address, setL2Address] = useState('');
  const [error, setError] = useState();
  useEffect(() => {
    if (!l1Address) {
      return setError(undefined);
    }
    try {
      if (!isAddress(l1Address)) {
        throw new Error(`Invalid address: ${l1Address}`);
      }
      setL2Address(applyAlias(l1Address));
      setError(undefined);
    } catch (err) {
      setL2Address(undefined);
      setError(err.message);
    }
  }, [l1Address]);
  return (
    <>
      <input
        style={{
          width: '100%',
          fontSize: '16px',
          padding: 'var(--space-m) var(--space-l)',
          marginBottom: 'var(--space-xs)',
        }}
        placeholder="Paste an L1 Contract Address"
        value={l1Address}
        onChange={(event) => setL1Address(event.target.value)}
      />
      {l2Address && (
        <div>
          <strong>L2 Alias:</strong> <span>{l2Address}</span>
        </div>
      )}
      {error && (
        <div
          style={{
            backgroundColor: 'var(--red-light)',
            padding: 'var(--space-s)',
            borderRadius: 'var(--border-radius-s)',
          }}
        >
          <strong>Error:</strong> <span>{error}</span>
        </div>
      )}
    </>
  );
};
