import React, { useEffect, useState } from 'react';
import { Address } from '@arbitrum/sdk';

export const AddressAliasHelper = () => {
  const [l1Address, setL1Address] = useState('');
  const [l2Address, setL2Address] = useState('');
  const [error, setError] = useState();
  useEffect(() => {
    if (!l1Address) {
      return setError(undefined);
    }
    try {
      const l1addr = new Address(l1Address);
      const afterApply = l1addr.applyAlias();
      setL2Address(afterApply.value);
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
